import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { AppDataTableComponent } from '@shared/components/ui/app-data-table/data-table.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-claim-verification',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    AppCardComponent,
    AppButtonComponent,
    AppPaginationComponent,
    AppDataTableComponent
  ],
  templateUrl: './claim-verification.component.html',
  styleUrls: ['./claim-verification.component.scss']
})
export class ClaimVerificationComponent implements OnInit {
  // Enums match the backend BillStatus enum (0 = Draft, 1 = Pending, 2 = Verified, 3 = Rejected, 4 = PostedToTreasury)
  // For Nodal Officers, they only deal with Pending (1), Verified (2), Rejected (3)
  activeTab = signal<number>(1); 
  
  isLoading = signal<boolean>(false);
  claims = signal<any[]>([]);
  
  // Bills view state
  showBills = signal<boolean>(false);
  currentClaim = signal<any>(null);
  bills = signal<any[]>([]);

  // Pagination for Claims
  currentPage = signal<number>(1);
  itemsPerPage = 10;
  
  // Pagination for Bills
  billsCurrentPage = signal<number>(1);
  billsItemsPerPage = 10;

  claimTableColumns = [
    { key: 'index', label: '#', width: '50px' },
    { key: 'claimNumber', label: 'Claim Number', sortable: true },
    { key: 'type', label: 'Claim Type', sortable: true },
    { key: 'createdBy', label: 'Created By', sortable: true },
    { key: 'createdAt', label: 'Created At', type: 'date', sortable: true },
    { key: 'totalAmount', label: 'Total Amount', type: 'currency', sortable: true }
  ];

  billTableColumns = [
    { key: 'index', label: '#' },
    { key: 'billNumber', label: 'Bill Number' },
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'billDate', label: 'Bill Date', type: 'date' },
    { key: 'amount', label: 'Amount', type: 'currency' }
  ];

  claimActions = [
    {
      label: 'View Bills',
      icon: '<i class="pi pi-eye"></i>',
      action: (row: any) => this.viewClaimBills(row)
    }
  ];

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadClaims();
  }

  setTab(status: number) {
    this.activeTab.set(status);
    this.currentPage.set(1);
    this.loadClaims();
  }

  loadClaims() {
    this.isLoading.set(true);
    // GET api/billing/claims?status={status}
    this.http.get<any>(`${environment.apiUrl}/billing/claims?status=${this.activeTab()}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.claims.set(res.result.map((item: any, index: number) => ({ ...item, index: index + 1 })));
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load claims');
        this.isLoading.set(false);
      }
    });
  }

  viewClaimBills(claim: any) {
    this.currentClaim.set(claim);
    this.showBills.set(true);
    this.isLoading.set(true);
    
    // GET api/billing/claims/{id}
    this.http.get<any>(`${environment.apiUrl}/billing/claims/${claim.billClaimId}`).subscribe({
      next: (res) => {
        if (res.success) {
          // Extract bills based on claim type
          let extractedBills = [];
          const data = res.result;
          if (data.type === 1) extractedBills = data.fuelBills || [];
          else if (data.type === 2) extractedBills = data.maintenanceBills || [];
          else if (data.type === 3) extractedBills = data.hiredVehicleBills || [];
          else if (data.type === 4) extractedBills = data.contractualBills || [];
          else if (data.type === 5) extractedBills = data.miscellaneousBills || [];
          
          this.bills.set(extractedBills.map((item: any, index: number) => ({ ...item, index: index + 1 })));
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load bills for this claim');
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.showBills.set(false);
    this.currentClaim.set(null);
    this.bills.set([]);
  }

  verifyRejectClaim(isVerify: boolean) {
    const action = isVerify ? 'Verify' : 'Reject';
    const claim = this.currentClaim();
    
    Swal.fire({
      title: `Confirm ${action}`,
      text: `Are you sure you want to ${action.toLowerCase()} claim ${claim.claimNumber}?`,
      icon: isVerify ? 'question' : 'warning',
      input: 'textarea',
      inputPlaceholder: 'Enter comments (optional for verify, required for reject)',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel',
      preConfirm: (comments) => {
        if (!isVerify && !comments) {
          Swal.showValidationMessage('Comments are required when rejecting a claim');
          return false;
        }
        return comments;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const comments = result.value || '';
        const endpoint = isVerify ? 'verify' : 'reject';
        
        this.http.post<any>(`${environment.apiUrl}/billing/claims/${claim.billClaimId}/${endpoint}`, `"${comments}"`, {
          headers: { 'Content-Type': 'application/json' }
        }).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                title: 'Success!',
                text: `Claim ${action.toLowerCase()}ed successfully`,
                icon: 'success',
                timer: 1800,
                showConfirmButton: false
              });
              this.goBack();
              // Navigate to Verified tab (2) after verify, stay on Pending tab (1) after reject
              this.activeTab.set(isVerify ? 2 : 1);
              this.currentPage.set(1);
              this.loadClaims();
            } else {
              this.toastr.error(`Failed to ${action.toLowerCase()} claim`);
            }
          },
          error: (err) => {
            this.toastr.error(err.error?.msg || `An error occurred while ${action.toLowerCase()}ing`);
          }
        });
      }
    });
  }

  // --- Pagination Logic ---
  
  paginatedClaims = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.claims().slice(start, start + this.itemsPerPage);
  });

  paginatedBills = computed(() => {
    const start = (this.billsCurrentPage() - 1) * this.billsItemsPerPage;
    return this.bills().slice(start, start + this.billsItemsPerPage);
  });

  totalClaimPages = computed(() => Math.ceil(this.claims().length / this.itemsPerPage));
  totalBillPages = computed(() => Math.ceil(this.bills().length / this.billsItemsPerPage));

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onBillPageChange(page: number) {
    this.billsCurrentPage.set(page);
  }
}
