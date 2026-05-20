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
import Swal from 'sweetalert2';

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
      icon: '<i class="pi pi-eye"></i>'
    },
    {
      label: 'Edit',
      action: (row: FuelVoucher) => this.editVoucher(row),
      icon: '<i class="pi pi-pencil"></i>'
    },
    {
      label: 'Delete',
      action: (row: FuelVoucher) => this.deleteVoucher(row),
      variant: 'danger',
      icon: '<i class="pi pi-trash"></i>'
    },
  ];

  viewVoucher(voucher: FuelVoucher): void {
    console.log('Viewing voucher:', voucher);
    this.toastr.info(`Opening Bill #${voucher.billNumber} in view mode`, 'Redirecting');
    this.router.navigate(['/bill-voucher/edit', voucher.fuelBillId], { queryParams: { view: 'true' } });
  }

  editVoucher(voucher: FuelVoucher): void {
    console.log('Editing voucher:', voucher);
    this.toastr.info(`Opening Bill #${voucher.billNumber} for editing`, 'Redirecting');
    this.router.navigate(['/bill-voucher/edit', voucher.fuelBillId]);
  }

  async deleteVoucher(voucher: FuelVoucher): Promise<void> {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete Bill #${voucher.billNumber}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if ((result as any).isConfirmed) {
      try {
        const success = await firstValueFrom(this.fuelVouchersService.deleteVoucher(voucher.fuelBillId));
        if (success) {
          Swal.fire(
            'Deleted!',
            'The fuel bill has been deleted.',
            'success'
          );
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
