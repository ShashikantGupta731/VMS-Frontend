import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MiscellaneousStoreVouchersService } from './miscellaneous-store-vouchers.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { MiscellaneousBill } from '@shared/services/billing.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-miscellaneous-store-vouchers',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppDataTableComponent, AppPaginationComponent],
  providers: [MiscellaneousStoreVouchersService],
  templateUrl: './miscellaneous-store-vouchers.component.html',
  styleUrl: './miscellaneous-store-vouchers.component.scss'
})
export class MiscellaneousStoreVouchersComponent {
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private voucherService = inject(MiscellaneousStoreVouchersService);

  // Pagination State
  currentPage = signal(1);
  itemsPerPage = 10;

  // Modern Data Fetching using rxResource
  vouchersResource = rxResource<MiscellaneousBill[], unknown>({
    stream: () => this.voucherService.getVouchers()
  });

  // Table columns mapped to backend MiscellaneousBillResponseDto
  tableColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill No.', sortable: true },
    { key: 'inventoryName', label: 'Item Name', sortable: true },
    { key: 'billDate', label: 'Bill Date', sortable: true },
    { key: 'quantity', label: 'Qty', sortable: true },
    { key: 'amount', label: 'Amount (₹)', sortable: true },
  ];

  tableActions: TableAction[] = [
    {
      label: 'View',
      action: (row: MiscellaneousBill) => this.viewVoucher(row),
      icon: '<i class="bi bi-eye"></i>'
    },
    {
      label: 'Edit',
      action: (row: MiscellaneousBill) => this.editVoucher(row),
      icon: '<i class="bi bi-pencil"></i>'
    },
    {
      label: 'Delete',
      action: (row: MiscellaneousBill) => this.deleteVoucher(row),
      variant: 'danger',
      icon: '<i class="bi bi-trash"></i>'
    },
  ];

  viewVoucher(voucher: MiscellaneousBill): void {
    this.router.navigate(['/miscellaneous-store-voucher/create'], { 
      queryParams: { id: voucher.miscellaneousBillId, mode: 'view', type: 'bill' } 
    });
  }

  editVoucher(voucher: MiscellaneousBill): void {
    this.router.navigate(['/miscellaneous-store-voucher/create'], { 
      queryParams: { id: voucher.miscellaneousBillId, mode: 'edit', type: 'bill' } 
    });
  }

  async deleteVoucher(voucher: MiscellaneousBill): Promise<void> {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete Bill #${voucher.billNumber}? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await firstValueFrom(this.voucherService.deleteVoucher(voucher.miscellaneousBillId));
        this.toastr.success('Bill deleted successfully');
        this.vouchersResource.reload();
      } catch (error) {
        this.toastr.error('Failed to delete bill');
      }
    }
  }

  createNewVoucher(): void {
    this.router.navigate(['/miscellaneous-store-voucher/create']);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  // Computed properties for efficient template rendering
  paginatedVouchers = computed(() => {
    const data = this.vouchersResource.value() || [];
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return data.slice(start, start + this.itemsPerPage);
  });

  totalItems = computed(() => (this.vouchersResource.value() || []).length);
  totalPagesCount = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));
  isLoading = computed(() => this.vouchersResource.isLoading());
}
