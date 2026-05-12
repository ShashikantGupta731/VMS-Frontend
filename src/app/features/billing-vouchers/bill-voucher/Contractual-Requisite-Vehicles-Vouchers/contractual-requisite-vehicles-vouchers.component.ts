import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ContractualRequisiteVehiclesVouchersService, ContractualBill } from './contractual-requisite-vehicles-vouchers.service';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-contractual-requisite-vehicles-vouchers',
  standalone: true,
  imports: [CommonModule, RouterModule, AppButtonComponent, AppDataTableComponent],
  providers: [ContractualRequisiteVehiclesVouchersService],
  templateUrl: './contractual-requisite-vehicles-vouchers.component.html',
  styleUrl: './contractual-requisite-vehicles-vouchers.component.scss'
})
export class ContractualRequisiteVehiclesVouchersComponent implements OnInit {
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private contractualService = inject(ContractualRequisiteVehiclesVouchersService);

  isLoading = signal(false);

  // Use rxResource for modern data fetching
  vouchersResource = rxResource<ContractualBill[], any>({
    stream: () => this.contractualService.getVouchers()
  });

  // Table columns
  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'billNumber', label: 'Bill No.' },
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'status', label: 'Status' },
  ];

  // Table actions
  tableActions: TableAction[] = [
    {
      label: 'Delete',
      action: (row: ContractualBill) => this.deleteVoucher(row),
      variant: 'danger'
    }
  ];

  ngOnInit(): void {}

  async deleteVoucher(voucher: ContractualBill): Promise<void> {
    if (confirm('Are you sure you want to delete this drafted voucher?')) {
      this.isLoading.set(true);
      try {
        await firstValueFrom(this.contractualService.deleteVoucher(voucher.id));
        this.toastr.success('Voucher deleted successfully', 'Success');
        this.vouchersResource.reload();
      } catch (error) {
        this.toastr.error('Failed to delete voucher', 'Error');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  createNewVoucher(): void {
    this.router.navigate(['/contractual-requisite-vehicle-voucher/create']);
  }
}
