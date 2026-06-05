import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { PendingBillIntegrationService, PendingIntegrationClaim } from './pending-bill-integration.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';

@Component({
  selector: 'app-pending-bill-integration',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppCardComponent,
    AppButtonComponent,
    AppDataTableComponent
  ],
  templateUrl: './pending-bill-integration.html',
  styleUrls: ['./pending-bill-integration.scss']
})
export class PendingBillIntegrationComponent implements OnInit {
  claims: PendingIntegrationClaim[] = [];
  isLoading = false;
  totalItems = 0;

  private pendingBillService = inject(PendingBillIntegrationService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  tableColumns: TableColumn[] = [
    { key: 'claimNumber', label: 'Claim No', sortable: true },
    { 
      key: 'claimFor', 
      label: 'Claim For', 
      sortable: true,
      render: (val: any) => `<strong>${val}</strong>`
    },
    { 
      key: 'createdAt', 
      label: 'Date', 
      sortable: true,
      render: (val: any) => {
        if (!val) return '';
        const date = new Date(val);
        if (isNaN(date.getTime())) return val;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(date.getDate()).padStart(2, '0')}/${months[date.getMonth()]}/${date.getFullYear()}`;
      }
    },
    { 
      key: 'totalAmount', 
      label: 'Amount', 
      sortable: true,
      render: (val: any) => val !== undefined ? '₹' + Number(val).toLocaleString('en-IN') : '₹0'
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (val: any, row: any) => {
        if (row.status === 4) {
          return `<span class="badge bg-danger-subtle text-danger px-2 py-1 rounded">Discarded</span>`;
        }
        return `<span class="badge bg-warning-subtle text-warning px-2 py-1 rounded">Pending</span>`;
      }
    }
  ];

  tableActions: TableAction[] = [
    {
      label: 'Discard',
      icon: '<i class="pi pi-trash"></i>',
      action: (row: PendingIntegrationClaim) => this.discardBill(row),
      disabled: (row: PendingIntegrationClaim) => row.status === 4 // Disable if already discarded
    },
    {
      label: 'Restore',
      icon: '<i class="pi pi-refresh"></i>',
      action: (row: PendingIntegrationClaim) => this.restoreBill(row),
      disabled: (row: PendingIntegrationClaim) => row.status !== 4 // Disable if not discarded
    }
  ];

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.isLoading = true;
    this.pendingBillService.getPendingIntegrationClaims().subscribe({
      next: (data) => {
        this.claims = data;
        this.totalItems = data.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching claims:', err);
        this.toastr.error('Failed to load pending bills');
        this.isLoading = false;
      }
    });
  }

  getTotalAmount(): number {
    return this.claims.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  }

  discardBill(bill: PendingIntegrationClaim): void {
    Swal.fire({
      title: 'Discarding Bill from VMS',
      html: '<div style="color: red;"> <strong> You are discarding the bill from VMS. You will not be able to edit or update the following bill. Please proceed with caution. </strong> </div> <br>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Processing Request!', 
          text: 'Please wait while we process your request...', 
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
            this.pendingBillService.discardClaim(bill.billClaimId).subscribe({
              next: (res) => {
                if (res.success) {
                  Swal.fire('Success', 'Successfully discarded from VMS.', 'success');
                  this.loadClaims();
                } else {
                  Swal.fire('Error', 'There was a problem discarding the bill, try again later.', 'error');
                }
              },
              error: (err) => {
                Swal.fire('Error', 'There was a problem discarding the bill, try again later.', 'error');
              }
            });
          }
        });
      }
    });
  }

  restoreBill(bill: PendingIntegrationClaim): void {
    Swal.fire({
      title: 'Restore Bill',
      html: '<div> <strong> Are you sure you want to restore this bill? </strong> </div> <br>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Processing Request!', 
          text: 'Please wait while we process your request...', 
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
            this.pendingBillService.restoreClaim(bill.billClaimId).subscribe({
              next: (res) => {
                if (res.success) {
                  Swal.fire('Success', 'Bill has been restored successfully. Bill can be found under "Bill Ready for IFMS" section.', 'success');
                  this.loadClaims();
                } else {
                  Swal.fire('Error', 'There was a problem in restoring the bill, try again later.', 'error');
                }
              },
              error: (err) => {
                Swal.fire('Error', 'There was a problem in restoring the bill, try again later.', 'error');
              }
            });
          }
        });
      }
    });
  }
}
