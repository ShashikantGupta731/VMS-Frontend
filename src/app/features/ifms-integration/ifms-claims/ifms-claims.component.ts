import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { IfmsClaimsService, IfmsClaim, FilterSummary } from './ifms-claims.service';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';

interface ExtendedIfmsClaim extends IfmsClaim {
  fuelMaintenanceLabel?: string;
}

@Component({
  selector: 'app-ifms-claims',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppButtonComponent, AppPaginationComponent, AppDataTableComponent, AppInputComponent],
  providers: [IfmsClaimsService],
  templateUrl: './ifms-claims.component.html',
  styleUrl: './ifms-claims.component.scss'
})
export class IfmsClaimsComponent implements OnInit, OnDestroy {
  claimsForm: FormGroup;
  claims: ExtendedIfmsClaim[] = [];
  filteredClaims: ExtendedIfmsClaim[] = [];
  filterSummary: FilterSummary | null = null;
  isLoading = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Sorting
  sortColumn: string = 'actionDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Dynamic Dropdown options
  financialYears: { label: string, value: string }[] = [];
  financialYearOptions: { label: string, value: string }[] = [];
  
  claimTypeOptions = [
    { label: 'Fuel', value: '1' },
    { label: 'Maintenance', value: '2' },
    { label: 'Hired Vehicle', value: '3' },
    { label: 'Misc. Store', value: '4' },
    { label: 'Contractual/Requisite Vehicle', value: '5' }
  ];

  // Table columns - now mapped to our new VMS billing model
  tableColumns: TableColumn[] = [
    { key: 'claimNumber', label: 'Claim No', sortable: true },
    { key: 'fuelMaintenanceLabel', label: 'Claim Type', sortable: true },
    { key: 'createdBy', label: 'Submitted By', sortable: true },
    { key: 'actionDate', label: 'Date', sortable: true },
    { key: 'amount', label: 'Amount (₹)', sortable: true },
    { key: 'statusBadge', label: 'Status', allowHtml: true },
  ];

  // Table actions integrating lazy PDF compilation & treasury upload
  tableActions: TableAction[] = [
    {
      label: 'Upload Vouchers',
      icon: '<i class="pi pi-upload"></i>',
      action: (row: ExtendedIfmsClaim) => {
        if (this.canUploadVouchers(row)) {
          this.upLoadDocumentDetails(row);
        } else {
          this.toastr.warning(`Vouchers cannot be uploaded when bill status is '${row.status}'.`, 'Invalid Action');
        }
      }
    },
    {
      label: 'View Details',
      icon: '<i class="pi pi-eye"></i>',
      action: (row: ExtendedIfmsClaim) => this.viewClaim(row),
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private ifmsClaimsService: IfmsClaimsService
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
    // 1. Generate years dynamically from 2017 to current year (Indian FY definitions)
    this.financialYears = this.generateFinancialYears(2017);
    this.financialYearOptions = this.financialYears;

    // 2. Select default current financial year on load
    const defaultFY = this.financialYearOptions[0];
    const [from, to] = defaultFY.value.split('|');
    this.claimsForm.patchValue({
      financialYear: defaultFY.value,
      fromDate: from,
      toDate: to
    }, { emitEvent: false });

    this.setupSearchDebounce();
    
    // Defer initial load to prevent ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loadClaims();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  generateFinancialYears(startYear: number = 2017): { label: string; value: string }[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const fyStartYear = (now.getMonth() < 3) ? currentYear - 1 : currentYear; // April 1 threshold
    const years = [];
    for (let year = fyStartYear; year >= startYear; year--) {
      years.push({
        label: `${year}-${year + 1}`,
        value: `${year}-04-01|${year + 1}-03-31`
      });
    }
    return years;
  }

  getClaimTypeLabel(typeCode: number): string {
    switch (typeCode) {
      case 1: return 'Fuel';
      case 2: return 'Maintenance';
      case 3: return 'Hired Vehicle';
      case 4: return 'Misc. Store';
      case 5: return 'Contractual/Requisite Vehicle';
      default: return 'Other';
    }
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (searchText) => {
        this.claimsForm.patchValue({ searchText }, { emitEvent: false });
        this.applyFiltersAndSearch();
      }
    });
  }

  onSearchChange(event: any): void {
    const text = typeof event === 'string' ? event : event?.target?.value || '';
    this.searchSubject.next(text);
  }

  onFilterChange(changedField: string): void {
    const filters = this.getFilterValues();

    if (changedField === 'financialYear' && filters.financialYear) {
      const [from, to] = filters.financialYear.split('|');
      this.claimsForm.patchValue({
        fromDate: from,
        toDate: to
      }, { emitEvent: false });
    }

    // Since date range or year selection changed, fetch the new period's dataset from DB
    this.loadClaims();
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

  private applyFiltersAndSearch(): void {
    const filters = this.getFilterValues();
    let temp = [...this.claims];

    // 1. Filter locally by Claim Type
    if (filters.claimType) {
      temp = temp.filter(c => c.fuelMaintenance === Number(filters.claimType));
    }

    // 2. Filter locally by search input (using new field names)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      temp = temp.filter(c =>
        (c.claimNumber && c.claimNumber.toLowerCase().includes(searchLower)) ||
        (c.fuelMaintenanceLabel && c.fuelMaintenanceLabel.toLowerCase().includes(searchLower)) ||
        (c.createdBy && c.createdBy.toLowerCase().includes(searchLower))
      );
    }

    // 3. Filter locally by Date Range (fromDate and toDate)
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      fromDate.setHours(0, 0, 0, 0);
      temp = temp.filter(c => c.actionDate ? new Date(c.actionDate) >= fromDate : true);
    }
    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999);
      temp = temp.filter(c => c.actionDate ? new Date(c.actionDate) <= toDate : true);
    }

    this.filteredClaims = temp;
    this.totalItems = temp.length;
    this.currentPage = 1;
    this.calculateSummaryTotals();
    this.sortClaims();
  }

  private calculateSummaryTotals(): void {
    const filters = this.getFilterValues();
    this.filterSummary = {
      claimType: filters.claimType ? this.getClaimTypeLabel(Number(filters.claimType)) : 'All',
      fromDate: filters.fromDate || 'N/A',
      toDate: filters.toDate || 'N/A',
      totalAmount: this.filteredClaims.reduce((sum, c) => sum + (c.amount ?? c.totalAmount ?? 0), 0),
      totalRows: this.filteredClaims.length
    };
  }

  private loadClaims(): void {
    this.isLoading = true;

    // Now calls our new VMS backend for Verified claims (status=2)
    this.ifmsClaimsService.getVerifiedClaims().subscribe({
      next: (res) => {
        setTimeout(() => {
          if (res.success && res.result) {
            this.claims = res.result.map(c => ({
              ...c,
              fuelMaintenanceLabel: this.getClaimTypeLabel(c.fuelMaintenance || c.type),
              // Add status badge HTML for display
              statusBadge: '<span class="badge bg-success">Verified</span>'
            }));
            this.applyFiltersAndSearch();
          } else {
            this.toastr.error('Failed to load verified claims', 'Error');
          }
          this.isLoading = false;
        });
      },
      error: (error: any) => {
        setTimeout(() => {
          console.error('Load claims error:', error);
          this.toastr.error('Failed to load claims from server', 'Error');
          this.isLoading = false;
        });
      }
    });
  }

  updateStatusFromIFMS(): void {
    this.isLoading = true;
    this.ifmsClaimsService.updateStatusFromIFMS().subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(res.message || 'Status updated successfully from IFMS', 'Success');
          this.loadClaims();
        } else {
          this.toastr.error(res.message || 'Failed to update status', 'Error');
          setTimeout(() => {
            this.isLoading = false;
          });
        }
      },
      error: (error: any) => {
        console.error('Update status error:', error);
        this.toastr.error('Failed to connect to synchronization service', 'Error');
        setTimeout(() => {
          this.isLoading = false;
        });
      }
    });
  }

  canUploadVouchers(claim: ExtendedIfmsClaim): boolean {
    // In the new system, a claim is uploadable when status = Verified (2)
    const statusNum = typeof claim.status === 'number' ? claim.status : Number(claim.status);
    return statusNum === 2;
  }

  upLoadDocumentDetails(row: ExtendedIfmsClaim): void {
    const billNo = row.ifmsBillNo || row.claimNo;

    Swal.fire({
      title: 'Upload Supporting Documents',
      html: `
        <div class="text-start p-2">
          <p class="small text-muted">Select scanned PDF receipts/vouchers to compile, stamp, and upload as a single file for <strong>Bill No: ${billNo}</strong>.</p>
          <input type="file" id="treasuryFiles" class="form-control" accept="application/pdf" multiple />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Compile & Upload',
      confirmButtonColor: '#0d6efd',
      preConfirm: () => {
        const fileInput = document.getElementById('treasuryFiles') as HTMLInputElement;
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
          Swal.showValidationMessage('Please select at least one PDF file.');
          return false;
        }
        return Array.from(fileInput.files);
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        this.isLoading = true;
        try {
          const files = result.value as File[];
          const mergedPdfBytes = await this.mergeAndStampPdfs(files, String(billNo));

          const mergedBlob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
          const formData = new FormData();
          formData.append('billNo', String(billNo));
          formData.append('mergedFile', mergedBlob, `Merged_${billNo}.pdf`);

          this.ifmsClaimsService.uploadMergedPdf(formData).subscribe({
            next: (res) => {
              this.isLoading = false;
              if (res.success) {
                this.toastr.success('Vouchers successfully compiled, stamped, and securely uploaded to Punjab Treasury sFTP!', 'Success');
                this.loadClaims();
              } else {
                this.toastr.error('Failed to upload vouchers to treasury portal', 'Upload Error');
              }
            },
            error: (err) => {
              this.isLoading = false;
              console.error(err);
              this.toastr.error('Failed to transmit files to backend.', 'Server Error');
            }
          });
        } catch (error: any) {
          this.isLoading = false;
          console.error(error);
          this.toastr.error('PDF compilation failed: ' + error.message, 'Assembly Error');
        }
      }
    });
  }

  private async mergeAndStampPdfs(files: File[], billNo: string): Promise<Uint8Array> {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    const mergedPdf = await PDFDocument.create();
    const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

    for (const file of files) {
      const fileBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

      for (const page of copiedPages) {
        const { width, height } = page.getSize();
        page.drawText(`IFMS Bill No - ${billNo}`, {
          x: 20,
          y: height - 30,
          size: 14,
          font: font,
          color: rgb(0, 0, 0)
        });
        mergedPdf.addPage(page);
      }
    }

    return await mergedPdf.save();
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
      const aValue = a[this.sortColumn as keyof ExtendedIfmsClaim];
      const bValue = b[this.sortColumn as keyof ExtendedIfmsClaim];

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

  getPaginatedClaims(): ExtendedIfmsClaim[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredClaims.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  viewClaim(claim: ExtendedIfmsClaim): void {
    // Navigate to the existing ClaimDetailsComponent at /bill-voucher/claim/:id
    const id = claim.billClaimId;
    if (id) {
      this.router.navigate(['/bill-voucher/claim', id]);
    } else {
      this.toastr.warning('Claim ID not available', 'Navigation Error');
    }
  }

  goBackToHome(): void {
    this.router.navigate(['/vehicle']);
  }

  clearFilters(): void {
    this.claimsForm.reset();
    const defaultFY = this.financialYearOptions[0];
    const [from, to] = defaultFY.value.split('|');
    this.claimsForm.patchValue({
      financialYear: defaultFY.value,
      fromDate: from,
      toDate: to
    }, { emitEvent: false });

    this.loadClaims();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  getPaginationEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
