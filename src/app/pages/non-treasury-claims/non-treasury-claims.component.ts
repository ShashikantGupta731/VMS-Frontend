import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, switchMap, of, takeUntil } from 'rxjs';
import { NonTreasuryClaimsService, NonTreasuryClaim, FilterSummary } from './non-treasury-claims.service';
import { AppCardComponent } from '../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '../../shared/components/ui/app-pagination/pagination.component';
import { AppDataTableComponent, TableColumn, TableAction } from '../../shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '../../shared/components/ui/app-input/input.component';

@Component({
  selector: 'app-non-treasury-claims',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppCardComponent, AppButtonComponent, AppPaginationComponent, AppDataTableComponent, AppInputComponent],
  providers: [NonTreasuryClaimsService],
  templateUrl: './non-treasury-claims.component.html',
  styleUrl: './non-treasury-claims.component.scss'
})
export class NonTreasuryClaimsComponent implements OnInit {
  claimsForm: FormGroup;
  claims: NonTreasuryClaim[] = [];
  filteredClaims: NonTreasuryClaim[] = [];
  filterSummary: FilterSummary | null = null;
  isLoading = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Sorting
  sortColumn: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Dropdown options
  financialYears = ['2024-2025', '2023-2024', '2022-2023', '2021-2022'];
  claimTypes = ['Fuel', 'Maintenance', 'Tyre Replacement', 'Insurance', 'Other'];

  // Options format for app-input component
  financialYearOptions = this.financialYears.map(year => ({ label: year, value: year }));
  claimTypeOptions = this.claimTypes.map(type => ({ label: type, value: type }));

  // Table columns with sortable support
  tableColumns: TableColumn[] = [
    { key: 'claimNo', label: 'Claim No', sortable: true },
    { key: 'claimFor', label: 'Claim For', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  // Table actions
  tableActions: TableAction[] = [
    {
      label: 'View',
      action: (row: NonTreasuryClaim) => this.viewClaim(row),
    },
    {
      label: 'Download',
      action: (row: NonTreasuryClaim) => this.downloadClaim(row),
    },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private nonTreasuryClaimsService: NonTreasuryClaimsService
  ) {
    this.claimsForm = this.fb.group({
      financialYear: [''],
      claimType: [''],
      fromDate: [''],
      toDate: [''],
      searchText: ['']
    });
  }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadClaims();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      switchMap((searchText) => {
        this.claimsForm.patchValue({ searchText });
        return this.nonTreasuryClaimsService.searchClaims(searchText, this.getFilterValues());
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (claims) => {
        this.filteredClaims = claims;
        this.totalItems = claims.length;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Search error:', error);
        this.toastr.error('Failed to search claims', 'Error');
      }
    });
  }

  onSearchChange(searchText: string): void {
    this.searchSubject.next(searchText);
  }

  onFilterChange(): void {
    const filters = this.getFilterValues();
    
    // Validate date range
    if (filters.fromDate && filters.toDate) {
      if (new Date(filters.fromDate) > new Date(filters.toDate)) {
        this.toastr.error('From date cannot be after To date', 'Invalid Date Range');
        this.claimsForm.patchValue({ toDate: '' });
        return;
      }
    }

    // Auto-set date range based on financial year
    if (filters.financialYear && !filters.fromDate && !filters.toDate) {
      const dateRange = this.getDateRangeFromFinancialYear(filters.financialYear);
      this.claimsForm.patchValue({
        fromDate: dateRange.from,
        toDate: dateRange.to
      });
    }

    this.applyFilters();
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
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Filter error:', error);
        this.toastr.error('Failed to apply filters', 'Error');
        this.isLoading = false;
      }
    });
  }

  private loadClaims(): void {
    this.isLoading = true;
    this.nonTreasuryClaimsService.getClaims().subscribe({
      next: (claims: NonTreasuryClaim[]) => {
        this.claims = claims;
        this.filteredClaims = claims;
        this.totalItems = claims.length;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Load claims error:', error);
        this.toastr.error('Failed to load claims', 'Error');
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
    this.updatePagination();
  }

  private updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    // Pagination is handled in template with slice
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
    console.log('View claim:', claim);
    // TODO: Implement view claim logic
    this.toastr.info('View claim details (Mock)', 'Info');
  }

  downloadClaim(claim: NonTreasuryClaim): void {
    console.log('Download claim:', claim);
    // TODO: Implement download logic
    this.toastr.success('Downloading claim document (Mock)', 'Success');
  }

  goBackToHome(): void {
    this.router.navigate(['/vehicle']);
  }

  clearFilters(): void {
    this.claimsForm.reset();
    this.filteredClaims = [...this.claims];
    this.filterSummary = null;
    this.totalItems = this.claims.length;
    this.currentPage = 1;
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  getPaginationEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
