import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { NonTreasuryClaimsService, NonTreasuryClaim, FilterSummary } from './non-treasury-claims.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';

@Component({
  selector: 'app-non-treasury-claims',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AppCardComponent,
    AppButtonComponent,
    AppPaginationComponent,
    AppDataTableComponent,
    AppInputComponent
  ],
  providers: [NonTreasuryClaimsService],
  templateUrl: './non-treasury-claims.component.html',
  styleUrl: './non-treasury-claims.component.scss'
})
export class NonTreasuryClaimsComponent implements OnInit, OnDestroy {
  claimsForm: FormGroup;
  filteredClaims: NonTreasuryClaim[] = [];
  filterSummary: FilterSummary | null = null;
  isLoading = false;
  private destroy$ = new Subject<void>();

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Sorting
  sortColumn: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Dropdown options
  financialYears: string[] = [];
  financialYearOptions: { label: string; value: string }[] = [];

  claimTypeOptions = [
    { label: 'All', value: '0' },
    { label: 'Fuel', value: '1' },
    { label: 'Maintenance', value: '2' },
    { label: 'Hired', value: '3' },
    { label: 'Miscellaneous Store', value: '4' },
    { label: 'Contractual/Requisite', value: '5' }
  ];

  // Table columns with sortable support and custom rendering
  tableColumns: TableColumn[] = [
    { key: 'claimNo', label: 'Claim No', sortable: true },
    { 
      key: 'claimFor', 
      label: 'Claim For', 
      sortable: true,
      render: (val: any) => `<strong>${val}</strong>`
    },
    { 
      key: 'date', 
      label: 'Date', 
      sortable: true,
      render: (val: any) => {
        if (!val) return '';
        const date = new Date(val);
        if (isNaN(date.getTime())) return val;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      sortable: true,
      render: (val: any) => val !== undefined ? '₹' + Number(val).toLocaleString('en-IN') : '₹0'
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (val: any, row: any) => {
        if (row.httpStatus === 200) {
          return `<span class="badge bg-success-subtle text-success px-2 py-1 rounded" style="font-size: 0.85em; font-weight: 500;">Bill Created</span>`;
        } else if (row.httpStatus === 301) {
          return `<span class="badge bg-danger-subtle text-danger px-2 py-1 rounded" style="font-size: 0.85em; font-weight: 500;">Bill Discarded from VMS</span>`;
        }
        return `<span class="badge bg-secondary-subtle text-secondary px-2 py-1 rounded" style="font-size: 0.85em; font-weight: 500;">${val}</span>`;
      }
    },
  ];

  // Table actions (retained as mocks or read-only preview placeholders)
  tableActions: TableAction[] = [
    {
      label: 'View',
      icon: '<i class="pi pi-eye"></i>',
      action: (row: NonTreasuryClaim) => this.viewClaim(row),
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private nonTreasuryClaimsService: NonTreasuryClaimsService
  ) {
    this.claimsForm = this.fb.group({
      financialYear: [''],
      claimType: ['0'],
      fromDate: [''],
      toDate: [''],
      searchText: ['']
    });
  }

  ngOnInit(): void {
    this.generateFinancialYears(2017);
    this.setupFormSubscription();
    
    // Defer initial load to prevent ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateFinancialYears(startYear: number = 2017): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    const fyStartYear = (now.getMonth() < 3) ? currentYear - 1 : currentYear; // April is month 3 (0-based)

    this.financialYears = [];
    for (let year = fyStartYear; year >= startYear; year--) {
      this.financialYears.push(`${year}-${year + 1}`);
    }
    this.financialYearOptions = this.financialYears.map(year => ({ label: year, value: year }));

    const defaultFy = `${fyStartYear}-${fyStartYear + 1}`;
    const dateRange = this.getDateRangeFromFinancialYear(defaultFy);

    this.claimsForm.patchValue({
      financialYear: defaultFy,
      fromDate: dateRange.from,
      toDate: dateRange.to
    }, { emitEvent: false });
  }

  private setupFormSubscription(): void {
    let lastProcessedFy = this.claimsForm.get('financialYear')?.value;

    this.claimsForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe((values) => {
      const currentFy = values.financialYear;
      if (currentFy && currentFy !== lastProcessedFy) {
        lastProcessedFy = currentFy;
        const dateRange = this.getDateRangeFromFinancialYear(currentFy);
        this.claimsForm.patchValue({
          fromDate: dateRange.from,
          toDate: dateRange.to
        }, { emitEvent: false });
      }

      this.applyFilters();
    });
  }

  private getDateRangeFromFinancialYear(year: string): { from: string; to: string } {
    const [startYear, endYear] = year.split('-').map(Number);
    return {
      from: `${startYear}-04-01`,
      to: `${endYear}-03-31`
    };
  }

  private getFilterValues(): any {
    return {
      financialYear: this.claimsForm.get('financialYear')?.value,
      claimType: this.claimsForm.get('claimType')?.value,
      fromDate: this.claimsForm.get('fromDate')?.value,
      toDate: this.claimsForm.get('toDate')?.value,
      searchText: this.claimsForm.get('searchText')?.value
    };
  }

  private applyFilters(): void {
    this.isLoading = true;
    const filters = this.getFilterValues();

    this.nonTreasuryClaimsService.getFilteredClaims(filters).subscribe({
      next: (data: { claims: NonTreasuryClaim[]; summary: FilterSummary }) => {
        this.filteredClaims = data.claims;
        this.filterSummary = data.summary;
        this.totalItems = data.claims.length;
        this.currentPage = 1;
        this.sortClaims();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Filter error:', error);
        this.toastr.error('Failed to apply filters', 'Error');
        this.isLoading = false;
      }
    });
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortClaims();
  }

  onSortFromTable(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.sortClaims();
  }

  private sortClaims(): void {
    this.filteredClaims.sort((a, b) => {
      const aValue = a[this.sortColumn as keyof NonTreasuryClaim];
      const bValue = b[this.sortColumn as keyof NonTreasuryClaim];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  getPaginatedClaims(): NonTreasuryClaim[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredClaims.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  viewClaim(claim: NonTreasuryClaim): void {
    if (claim.billClaimId) {
      this.router.navigate(['/bill-voucher/claim', claim.billClaimId]);
    } else {
      this.toastr.warning('Claim details not available for this record.', 'Warning');
    }
  }

  goBackToHome(): void {
    this.router.navigate(['/vehicle']);
  }

  clearFilters(): void {
    this.claimsForm.reset({
      financialYear: '',
      claimType: '0',
      fromDate: '',
      toDate: '',
      searchText: ''
    });
    this.generateFinancialYears(2017);
    this.applyFilters();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  getPaginationEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
