import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FuelVouchersService, FuelVoucher } from './fuel-vouchers.service';
import { AppCardComponent } from '../../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../../shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '../../../shared/components/ui/app-data-table/data-table.component';
import { AppPaginationComponent } from '../../../shared/components/ui/app-pagination/pagination.component';

@Component({
  selector: 'app-fuel-vouchers',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppDataTableComponent, AppPaginationComponent],
  providers: [FuelVouchersService],
  templateUrl: './fuel-vouchers.component.html',
  styleUrl: './fuel-vouchers.component.scss'
})
export class FuelVouchersComponent implements OnInit {
  vouchers: FuelVoucher[] = [];
  filteredVouchers: FuelVoucher[] = [];
  isLoading = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Table columns
  tableColumns: TableColumn[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'dateOfCreation', label: 'Date of Creation', sortable: true },
    { key: 'voucherAmount', label: 'Voucher Amount', sortable: true },
  ];

  // Table actions
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
    },
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private fuelVouchersService: FuelVouchersService
  ) {}

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.isLoading = true;
    this.fuelVouchersService.getVouchers().subscribe({
      next: (vouchers) => {
        this.vouchers = vouchers;
        this.filteredVouchers = vouchers;
        this.totalItems = vouchers.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vouchers:', error);
        this.toastr.error('Failed to load vouchers', 'Error');
        this.isLoading = false;
      }
    });
  }

  viewVoucher(voucher: FuelVoucher): void {
    console.log('View voucher:', voucher);
    this.toastr.info('View voucher details (Mock)', 'Info');
  }

  editVoucher(voucher: FuelVoucher): void {
    console.log('Edit voucher:', voucher);
    this.toastr.info('Edit voucher (Mock)', 'Info');
  }

  deleteVoucher(voucher: FuelVoucher): void {
    if (confirm('Are you sure you want to delete this voucher?')) {
      this.isLoading = true;
      this.fuelVouchersService.deleteVoucher(voucher.id).subscribe({
        next: () => {
          this.toastr.success('Voucher deleted successfully', 'Success');
          this.loadVouchers();
        },
        error: (error) => {
          console.error('Error deleting voucher:', error);
          this.toastr.error('Failed to delete voucher', 'Error');
          this.isLoading = false;
        }
      });
    }
  }

  createNewVoucher(): void {
    this.router.navigate(['/bill-voucher/create']);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  getPaginatedVouchers(): FuelVoucher[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredVouchers.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
}
