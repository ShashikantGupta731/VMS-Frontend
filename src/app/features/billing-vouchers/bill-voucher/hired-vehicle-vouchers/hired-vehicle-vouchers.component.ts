import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HiredVehicleVouchersService, HiredVehicleBill } from './hired-vehicle-vouchers.service';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hired-vehicle-vouchers',
  standalone: true,
  imports: [CommonModule, RouterModule, AppButtonComponent, AppDataTableComponent],
  providers: [HiredVehicleVouchersService],
  templateUrl: './hired-vehicle-vouchers.component.html',
  styleUrl: './hired-vehicle-vouchers.component.scss'
})
export class HiredVehicleVouchersComponent implements OnInit {
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private hiredService = inject(HiredVehicleVouchersService);

  isLoading = signal(false);

  // Use rxResource for modern data fetching
  vouchersResource = rxResource<HiredVehicleBill[], any>({
    stream: () => this.hiredService.getVouchers()
  });

  // Table columns
  tableColumns: TableColumn[] = [
    { key: 'hiredVehicleBillId', label: 'ID' },
    { key: 'billNumber', label: 'Bill No.' },
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'status', label: 'Status' },
  ];

  // Table actions
  tableActions: TableAction[] = [
    {
      label: 'View',
      action: (row: HiredVehicleBill) => this.viewVoucher(row),
      variant: 'primary'
    },
    {
      label: 'Edit',
      action: (row: HiredVehicleBill) => this.editVoucher(row),
      variant: 'warning'
    },
    {
      label: 'Delete',
      action: (row: HiredVehicleBill) => this.deleteVoucher(row),
      variant: 'danger'
    }
  ];

  ngOnInit(): void {}

  viewVoucher(voucher: HiredVehicleBill): void {
    // Navigate to create page with the bill ID and read-only mode
    this.router.navigate(['/bill-voucher/hired-vehicle/create'], {
      queryParams: { id: voucher.hiredVehicleBillId, mode: 'view' }
    });
  }

  editVoucher(voucher: HiredVehicleBill): void {
    // Navigate to create page with the bill ID for editing
    this.router.navigate(['/bill-voucher/hired-vehicle/create'], {
      queryParams: { id: voucher.hiredVehicleBillId, mode: 'edit' }
    });
  }

  async deleteVoucher(voucher: HiredVehicleBill): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete Voucher?',
      text: `Are you sure you want to delete Bill #${voucher.billNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      this.isLoading.set(true);
      try {
        await firstValueFrom(this.hiredService.deleteVoucher(voucher.hiredVehicleBillId));
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
    this.router.navigate(['/bill-voucher/hired-vehicle/create']);
  }
}

