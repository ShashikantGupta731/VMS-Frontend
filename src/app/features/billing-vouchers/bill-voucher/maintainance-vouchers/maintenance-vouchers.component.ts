import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MaintenanceVouchersService, MaintenanceBill } from './maintenance-vouchers.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-maintenance-vouchers',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppDataTableComponent, AppPaginationComponent],
  providers: [MaintenanceVouchersService],
  templateUrl: './maintenance-vouchers.component.html',
  styleUrl: './maintenance-vouchers.component.scss'
})
export class MaintenanceVouchersComponent {
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private maintenanceVouchersService = inject(MaintenanceVouchersService);

  // Pagination State
  currentPage = 1;
  itemsPerPage = 10;

  // Modern Data Fetching
  vouchersResource = rxResource<MaintenanceBill[], any>({
    stream: () => this.maintenanceVouchersService.getVouchers()
  });

  tableColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill No.', sortable: true },
    { key: 'vehicleNumber', label: 'Vehicle No.', sortable: true },
    { key: 'billDate', label: 'Date', sortable: true },
    { key: 'maintenanceType', label: 'Type', sortable: true },
    { key: 'amount', label: 'Amount (₹)', sortable: true },
  ];

  tableActions: TableAction[] = [
    {
      label: 'View',
      action: (row: MaintenanceBill) => this.viewVoucher(row),
    },
    {
      label: 'Edit',
      action: (row: MaintenanceBill) => this.editVoucher(row),
    },
    {
      label: 'Delete',
      action: (row: MaintenanceBill) => this.deleteVoucher(row),
      variant: 'danger'
    },
  ];

  viewVoucher(voucher: MaintenanceBill): void {
    this.router.navigate(['/maintenance-voucher/edit', voucher.maintenanceBillId], { queryParams: { view: 'true' } });
  }

  editVoucher(voucher: MaintenanceBill): void {
    this.router.navigate(['/maintenance-voucher/edit', voucher.maintenanceBillId]);
  }

  async deleteVoucher(voucher: MaintenanceBill): Promise<void> {
    if (confirm(`Are you sure you want to delete Maintenance Bill #${voucher.billNumber}?`)) {
      try {
        const success = await firstValueFrom(this.maintenanceVouchersService.deleteVoucher(voucher.maintenanceBillId));
        if (success) {
          this.toastr.success('Voucher deleted successfully', 'Success');
          this.vouchersResource.reload();
        }
      } catch (error) {
        this.toastr.error('Failed to delete voucher', 'Error');
      }
    }
  }

  createNewVoucher(): void {
    this.router.navigate(['/maintenance-voucher/create']);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  getPaginatedVouchers(): MaintenanceBill[] {
    const data = this.vouchersResource.value();
    if (!data || !Array.isArray(data)) return [];
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return data.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalItems(): number {
    const data = this.vouchersResource.value();
    return Array.isArray(data) ? data.length : 0;
  }

  get totalPagesCount(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
}
