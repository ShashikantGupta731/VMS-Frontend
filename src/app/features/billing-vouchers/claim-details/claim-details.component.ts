import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BillingService, BillClaimDetail, BillStatus, BillType } from '@shared/services/billing.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn } from '@shared/components/ui/app-data-table/data-table.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Observable, EMPTY } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-claim-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AppCardComponent, AppButtonComponent, AppDataTableComponent],
  templateUrl: './claim-details.component.html',
  styleUrl: './claim-details.component.scss'
})
export class ClaimDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private billingService = inject(BillingService);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  goBack(): void {
    this.location.back();
  }

  claimId = toSignal(this.route.params.pipe(map(p => Number(p['id']))));
  comments = signal('');
  isActionLoading = signal(false);

  claimResource = rxResource({
    stream: () => {
      const id = this.claimId();
      return id ? this.billingService.getClaimDetails(id) : EMPTY;
    }
  });

  canVerify = computed(() => {
    const claim = this.claimResource.value();
    const user = this.authService.currentUser();
    if (!claim || !user) return false;
    
    return claim.status === BillStatus.Pending && 
           user.roles.some(r => r === 'ADMN' || r === 'NDOF');
  });

  fuelColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill No.' },
    { key: 'vehicleNumber', label: 'Vehicle' },
    { key: 'billDate', label: 'Date', render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'fuelQuantity', label: 'Qty (Ltr)' },
    { key: 'amount', label: 'Amount', render: (val: number) => `₹${val.toLocaleString()}` }
  ];

  maintColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill No.' },
    { key: 'vehicleNumber', label: 'Vehicle' },
    { key: 'billDate', label: 'Date', render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'maintenanceType', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (val: number) => `₹${val.toLocaleString()}` }
  ];

  hiredColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill No.' },
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'billDate', label: 'Date', render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'contractorName', label: 'Contractor' },
    { key: 'kmCovered', label: 'KM Covered' },
    { key: 'amount', label: 'Amount', render: (val: number) => `₹${val.toLocaleString()}` }
  ];

  contractualColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill No.' },
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'billDate', label: 'Date', render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'vehicleType', label: 'Vehicle Type' },
    { key: 'amount', label: 'Amount', render: (val: number) => `₹${val.toLocaleString()}` }
  ];

  async verifyClaim(): Promise<void> {
    this.isActionLoading.set(true);
    try {
      const id = this.claimId();
      if (!id) return;
      await firstValueFrom(this.billingService.verifyClaim(id, this.comments()));
      this.toastr.success('Claim verified successfully', 'Success');
      this.router.navigate(['/bill-voucher']);
    } catch (error) {
      this.toastr.error('Failed to verify claim', 'Error');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  async rejectClaim(): Promise<void> {
    if (!this.comments()) {
      this.toastr.warning('Please provide rejection comments', 'Required');
      return;
    }
    this.isActionLoading.set(true);
    try {
      const id = this.claimId();
      if (!id) return;
      await firstValueFrom(this.billingService.rejectClaim(id, this.comments()));
      this.toastr.success('Claim rejected and sent back to DDO', 'Success');
      this.router.navigate(['/bill-voucher']);
    } catch (error) {
      this.toastr.error('Failed to reject claim', 'Error');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  getTypeLabel(type?: BillType): string {
    if (type === undefined) return '';
    switch (type) {
      case BillType.Fuel: return 'Fuel';
      case BillType.Maintenance: return 'Maintenance';
      default: return 'Bill';
    }
  }

  getStatusBadge(status?: BillStatus): string {
    if (status === undefined) return '';
    const badges: Record<number, string> = {
      [BillStatus.Draft]: '<span class="badge bg-secondary">Draft</span>',
      [BillStatus.Pending]: '<span class="badge bg-warning text-dark">Pending Verification</span>',
      [BillStatus.Verified]: '<span class="badge bg-success">Verified</span>',
      [BillStatus.Rejected]: '<span class="badge bg-danger">Rejected</span>',
    };
    return badges[status] || 'Unknown';
  }
}
