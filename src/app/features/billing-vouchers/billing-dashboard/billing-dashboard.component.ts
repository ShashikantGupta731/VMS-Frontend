import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BillingService, BillClaim, BillStatus, BillType } from '@shared/services/billing.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppDataTableComponent],
  templateUrl: './billing-dashboard.component.html',
  styleUrl: './billing-dashboard.component.scss'
})
export class BillingDashboardComponent {
  private router = inject(Router);
  private billingService = inject(BillingService);

  claimsResource = rxResource<BillClaim[], unknown>({
    stream: () => this.billingService.getClaims()
  });

  // Summary Metrics
  pendingCount = computed(() => (this.claimsResource.value() ?? []).filter(c => c.status === BillStatus.Pending).length);
  verifiedCount = computed(() => (this.claimsResource.value() ?? []).filter(c => c.status === BillStatus.Verified).length);
  rejectedCount = computed(() => (this.claimsResource.value() ?? []).filter(c => c.status === BillStatus.Rejected).length);

  tableColumns: TableColumn[] = [
    { key: 'claimNumber', label: 'Claim No.', sortable: true },
    { key: 'type', label: 'Type', render: (val: BillType) => this.getTypeLabel(val) },
    { key: 'totalAmount', label: 'Amount (₹)', sortable: true, render: (val: number) => `₹${val.toLocaleString()}` },
    { key: 'status', label: 'Status', render: (val: BillStatus) => this.getStatusBadge(val) },
    { key: 'createdAt', label: 'Date', render: (val: string) => new Date(val).toLocaleDateString() },
  ];

  tableActions: TableAction[] = [
    { label: 'View Details', action: (row: BillClaim) => this.viewClaim(row) },
  ];

  viewClaim(claim: BillClaim): void {
    this.router.navigate(['/bill-voucher/claim', claim.id]);
  }

  getTypeLabel(type: BillType): string {
    switch (type) {
      case BillType.Fuel: return 'Fuel';
      case BillType.Maintenance: return 'Maintenance';
      case BillType.Hired: return 'Hired Vehicle';
      case BillType.Contractual: return 'Contractual';
      default: return 'Other';
    }
  }

  getStatusBadge(status: BillStatus): string {
    const badges: Record<number, string> = {
      [BillStatus.Draft]: '<span class="badge bg-secondary">Draft</span>',
      [BillStatus.Pending]: '<span class="badge bg-warning text-dark">Pending Verification</span>',
      [BillStatus.Verified]: '<span class="badge bg-success">Verified</span>',
      [BillStatus.Rejected]: '<span class="badge bg-danger">Rejected</span>',
    };
    return badges[status] || 'Unknown';
  }

  navigateToCreate(type: string): void {
    switch (type) {
      case 'fuel': this.router.navigate(['/bill-voucher/create']); break;
      case 'maintenance': this.router.navigate(['/maintenance-voucher/create']); break;
    }
  }
}
