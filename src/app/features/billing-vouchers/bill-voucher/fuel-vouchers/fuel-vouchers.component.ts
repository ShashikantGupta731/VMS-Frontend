import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FuelVouchersService, FuelVoucher } from './fuel-vouchers.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-fuel-vouchers',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppDataTableComponent, AppPaginationComponent],
  providers: [FuelVouchersService],
  templateUrl: './fuel-vouchers.component.html',
  styleUrl: './fuel-vouchers.component.scss'
})
export class FuelVouchersComponent {
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private fuelVouchersService = inject(FuelVouchersService);

  // Pagination State
  currentPage = 1;
  itemsPerPage = 10;

  // Use rxResource with 'stream' property as per project pattern
  vouchersResource = rxResource<FuelVoucher[], unknown>({
    stream: () => this.fuelVouchersService.getVouchers()
  });

  // Table columns mapped to our new backend DTOs
  tableColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill No.', sortable: true },
    { key: 'vehicleNumber', label: 'Vehicle No.', sortable: true },
    { key: 'billDate', label: 'Date', sortable: true },
    { key: 'fuelQuantity', label: 'Qty (Ltr)', sortable: true },
    { key: 'amount', label: 'Amount (₹)', sortable: true },
  ];

  tableActions: TableAction[] = [
    {
      label: 'View',
      action: (row: FuelVoucher) => this.viewVoucher(row),
    },
    {
      label: 'Edit',
      action: (row: FuelVoucher) => this.editVoucher(row),
    },
    {
      label: 'Delete',
      action: (row: FuelVoucher) => this.deleteVoucher(row),
      variant: 'danger'
    },
  ];

  viewVoucher(voucher: FuelVoucher): void {
    this.toastr.info(`Viewing Bill #${voucher.billNumber}`, 'Details');
  }

  editVoucher(voucher: FuelVoucher): void {
    this.router.navigate(['/bill-voucher/edit', voucher.id]);
  }

  async deleteVoucher(voucher: FuelVoucher): Promise<void> {
    if (confirm(`Are you sure you want to delete Bill #${voucher.billNumber}?`)) {
      try {
        const success = await firstValueFrom(this.fuelVouchersService.deleteVoucher(voucher.id));
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
    this.router.navigate(['/bill-voucher/create']);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  getPaginatedVouchers(): FuelVoucher[] {
    const data = this.vouchersResource.value();
    if (!data || !Array.isArray(data)) return [];
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return data.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalItems(): number {
    const data = this.vouchersResource.value();
    return Array.isArray(data) ? data.length : 0;
  }

  // Use a getter without () for the template
  get totalPagesCount(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
}
