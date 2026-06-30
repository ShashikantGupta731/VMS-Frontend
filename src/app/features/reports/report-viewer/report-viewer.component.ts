import { Component, OnInit, signal, computed } from '@angular/core';
// DropdownResponseDto shape from backend: { id: number; name: string }
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api';
import { ActivatedRoute } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn } from '@shared/components/ui/app-data-table/data-table.component';
import { REPORT_CONFIGS, ReportConfig } from '../config/report.config';
import { VehicleDetailsModalComponent } from '@shared/components/vehicle-details-modal/vehicle-details-modal.component';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/** Search type options for Report 4 */
const SEARCH_TYPE_OPTIONS = [
  { value: 'vehicle', label: 'Vehicle Wise' },
  { value: 'officer', label: 'Officer Wise' },
  { value: 'designation', label: 'Designation Wise' }
];

/** Allocation type options for Report 9 */
const ALLOCATION_TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Earmarked', label: 'Earmarked' },
  { value: 'Pooled', label: 'Pooled' },
  { value: 'Contractual - Earmarked', label: 'Contractual - Earmarked' },
  { value: 'Contractual - Pooled', label: 'Contractual - Pooled' },
  { value: 'Requisition - Earmarked', label: 'Requisition - Earmarked' },
  { value: 'Requisition - Pooled', label: 'Requisition - Pooled' }
];

/** Bill type options for Reports 14 & 15 */
const BILL_TYPE_OPTIONS_POL = [
  { value: 'both', label: 'Vehicles not Posting Fuel and Maintenance Bills' },
  { value: 'fuel', label: 'Vehicles not Posting Fuel Bills' },
  { value: 'maintenance', label: 'Vehicles not Posting Maintenance Bills' }
];

const BILL_TYPE_OPTIONS_ODOMETER = [
  { value: 'fuel', label: 'Fuel Claims' },
  { value: 'maintenance', label: 'Maintenance Claims' }
];

/** Month options (1-based) */
const MONTH_OPTIONS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' },   { value: 4, label: 'April' },
  { value: 5, label: 'May' },     { value: 6, label: 'June' },
  { value: 7, label: 'July' },    { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' }
];

/** Build year list from 2015 to current year */
function buildYearList(): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= 2015; y--) years.push(y);
  return years;
}

/** Get current financial year start date (Apr 1) */
function getFYStart(): string {
  const now = new Date();
  const fyYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${fyYear}-04-01`;
}

/** Get current financial year end date (Mar 31 next year) */
function getFYEnd(): string {
  const now = new Date();
  const fyYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${fyYear + 1}-03-31`;
}

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, AppCardComponent, AppButtonComponent, AppDataTableComponent, VehicleDetailsModalComponent],
  template: `
    <div class="dashboard-container">
      <app-card customClass="no-padding">

        <!-- ── Header ─────────────────────────────────────────────────────── -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-2 mb-4 border-bottom">
          <div>
            <h1 class="fs-28 fw-bold text-dark mb-1">{{ title() }}</h1>
            <p class="text-muted small m-0">{{ subtitle() }}</p>
          </div>
          <div class="mt-2 mt-md-0 d-flex gap-2">
            <button class="custom-export-btn" (click)="exportExcel()" [disabled]="data().length === 0">
              <i class="pi pi-file-excel"></i> Export Excel
            </button>
            <button class="custom-export-btn" (click)="exportPdf()" [disabled]="data().length === 0">
              <i class="pi pi-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>

        <!-- ── Dynamic Filters ────────────────────────────────────────────── -->
        @if (config() && hasAnyFilter()) {
          <div class="row mb-4 align-items-end g-3 bg-light p-3 rounded mx-1">
            <h5 class="w-100 fs-16 mb-2 text-secondary border-bottom pb-1">Report Filters</h5>

            <!-- FROM DATE + TO DATE -->
            @if (config()!.filters.showDateRange) {
              <div class="col-md-3">
                <label class="form-label small fw-bold">From Date</label>
                <input type="date" class="form-control" [(ngModel)]="fromDate">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-bold">To Date</label>
                <input type="date" class="form-control" [(ngModel)]="toDate">
              </div>
            }

            <!-- DEPARTMENT -->
            @if (config()!.filters.showDept) {
              <div class="col-md-3">
                <label class="form-label small fw-bold">Department</label>
                <select class="form-select" [(ngModel)]="selectedDeptId" (change)="onDeptChange()">
                  <option [ngValue]="null">All</option>
                  @for (dept of departments(); track dept.deptId) {
                    <option [ngValue]="dept.deptId">{{ dept.deptName }}</option>
                  }
                </select>
              </div>
            }

            <!-- DISTRICT -->
            @if (config()!.filters.showDistrict) {
              <div class="col-md-3">
                <label class="form-label small fw-bold">District</label>
                <select class="form-select" [(ngModel)]="selectedDistrictId">
                  <option [ngValue]="null">All</option>
                  @for (d of districts(); track d.id) {
                    <option [ngValue]="d.id">{{ d.name }}</option>
                  }
                </select>
              </div>
            }

            <!-- OFFICE (cascades from dept - used in specific reports) -->
            @if (config()!.filters.showOffice) {
              <div class="col-md-3">
                <label class="form-label small fw-bold">Office</label>
                <select class="form-select" [(ngModel)]="selectedOfficeId">
                  <option [ngValue]="null">All Offices</option>
                  @for (office of offices(); track office.id) {
                    <option [ngValue]="office.id">{{ office.officeName }}</option>
                  }
                </select>
              </div>
            }

            <!-- ALLOCATION TYPE (Report 9 - Unverified) -->
            @if (config()!.filters.showAllocationTypeDropdown) {
              <div class="col-md-3">
                <label class="form-label small fw-bold">Allocation Type</label>
                <select class="form-select" [(ngModel)]="selectedAllocationType">
                  @for (opt of allocationTypeOptions; track opt.value) {
                    <option [ngValue]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
            }

            <!-- BILL TYPE (Reports 14, 15) -->
            @if (config()!.filters.showBillTypeDropdown) {
              <div class="col-md-4">
                <label class="form-label small fw-bold">Type</label>
                <select class="form-select" [(ngModel)]="selectedBillType">
                  @for (opt of activeBillTypeOptions(); track opt.value) {
                    <option [ngValue]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
            }

            <!-- MONTH + YEAR (Report 13 - Exceeded Fuel Limits) -->
            @if (config()!.filters.showMonthYear) {
              <div class="col-md-3">
                <label class="form-label small fw-bold">Select Month</label>
                <select class="form-select" [(ngModel)]="selectedMonth">
                  @for (m of monthOptions; track m.value) {
                    <option [ngValue]="m.value">{{ m.label }}</option>
                  }
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-bold">Select Year</label>
                <select class="form-select" [(ngModel)]="selectedYear">
                  @for (y of yearOptions; track y) {
                    <option [ngValue]="y">{{ y }}</option>
                  }
                </select>
              </div>
            }

            <!-- SEARCH TYPE + SEARCH VALUE (Report 4) -->
            @if (config()!.filters.showSearchTypeDropdown) {
              <div class="col-md-3">
                <label class="form-label small fw-bold">Search Type</label>
                <select class="form-select" [(ngModel)]="selectedSearchType">
                  <option [ngValue]="null">-- Please select --</option>
                  @for (opt of searchTypeOptions; track opt.value) {
                    <option [ngValue]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
            }

            @if (config()!.filters.showSearchValueInput) {
              <div class="col-md-4">
                <label class="form-label small fw-bold">Search Value</label>
                <input type="text" class="form-control" [(ngModel)]="searchValue"
                  placeholder="Enter Value">
              </div>
            }

            <!-- MANUFACTURER DROPDOWN (Report 5) -->
            @if (config()!.filters.showManufacturerDropdown) {
              <div class="col-md-4">
                <label class="form-label small fw-bold">Manufacturer</label>
                <select class="form-select" [(ngModel)]="selectedManufacturerId">
                  <option [ngValue]="null">-- Please select --</option>
                  @for (m of manufacturers(); track m.id) {
                    <option [ngValue]="m.id">{{ m.name }}</option>
                  }
                </select>
              </div>
            }

            <!-- VEHICLE NUMBER -->
            @if (config()!.filters.showVehicleNumber) {
              <div class="col-md-3">
                <label class="form-label small fw-bold">Vehicle Number</label>
                <input type="text" class="form-control" [(ngModel)]="vehicleNumber"
                  placeholder="e.g. PB01AB1234">
              </div>
            }

            <!-- GENERATE BUTTON: only shown when report has at least one filter -->
            @if (hasAnyFilter()) {
              <div class="col-md-2">
                <app-btn label="Search" (click)="generateReport()" variant="primary"
                  size="md" icon="pi pi-search" customClass="w-100">
                </app-btn>
              </div>
            }

          </div>
        }

        <!-- ── Data Table ─────────────────────────────────────────────────── -->
        <div class="mb-4 position-relative">
          @if (isLoading()) {
            <div class="table-loading-overlay">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          }

          @if (data().length > 0) {
            <div class="d-flex justify-content-end mb-3">
              <div class="col-md-3">
                <div class="input-group">
                  <span class="input-group-text bg-white border-end-0"><i class="pi pi-filter text-muted"></i></span>
                  <input type="text" class="form-control border-start-0 ps-0" 
                    [ngModel]="clientSearchTerm()" 
                    (ngModelChange)="clientSearchTerm.set($event)"
                    placeholder="Filter table rows...">
                </div>
              </div>
            </div>
          }

          <app-data-table
            [columns]="tableColumns()"
            [data]="filteredData()"
            [isLoading]="isLoading()"
            [sortable]="true"
            (rowClick)="handleRowClick($event)"
            emptyMessage="No data found for this report with the selected filters.">
          </app-data-table>
        </div>

      </app-card>

      <!-- Vehicle Drill Down Modal -->
      @if (showVehicleModal()) {
        <app-vehicle-details-modal
          [vehicleId]="selectedVehicleId()!"
          [registrationNumber]="selectedVehicleRegistration()"
          (close)="showVehicleModal.set(false)">
        </app-vehicle-details-modal>
      }
    </div>
  `,
  styleUrl: './report-viewer.component.scss'
})
export class ReportViewerComponent implements OnInit {

  // ── Signals ──────────────────────────────────────────────────────────────
  title     = signal<string>('Report Viewer');
  subtitle  = signal<string>('');
  config    = signal<ReportConfig | null>(null);
  data      = signal<any[]>([]);
  columns   = signal<string[]>([]);
  isLoading = signal<boolean>(false);

  // Modal State
  selectedVehicleId = signal<number | null>(null);
  selectedVehicleRegistration = signal<string>('');
  showVehicleModal = signal<boolean>(false);

  // Client-side table filter
  clientSearchTerm = signal<string>('');

  // filteredData: applies client search AND injects Sr. No. as first property
  filteredData = computed<any[]>(() => {
    const term = this.clientSearchTerm().toLowerCase().trim();
    const dataset = this.data();
    let rows = term
      ? dataset.filter(row =>
          Object.values(row).some(val =>
            val !== null && val !== undefined && String(val).toLowerCase().includes(term)
          )
        )
      : dataset;
    // Inject Sr. No. (1-based sequential number)
    return rows.map((row, index) => ({ SrNo: index + 1, ...row }));
  });

  // True when at least one filter control is active for this report
  hasAnyFilter = computed<boolean>(() => {
    const f = this.config()?.filters;
    if (!f) return false;
    return (
      f.showDept || f.showDistrict || f.showOffice ||
      f.showDateRange || f.showMonthYear ||
      f.showAllocationTypeDropdown || f.showBillTypeDropdown ||
      f.showSearchTypeDropdown || f.showManufacturerDropdown ||
      f.showSearchValueInput || f.showVehicleNumber
    );
  });

  // Master lookup lists
  // districts  → DropdownResponseDto: { id, name }
  // manufacturers → DropdownResponseDto: { id, name }
  departments   = signal<any[]>([]);
  districts     = signal<any[]>([]);
  offices       = signal<any[]>([]);
  manufacturers = signal<any[]>([]);   // { id: number; name: string }[]

  // ── Filter Values ────────────────────────────────────────────────────────
  // Date range
  fromDate: string = getFYStart();
  toDate: string   = getFYEnd();

  // Standard dropdowns
  selectedDeptId:     number | null = null;
  selectedDistrictId: number | null = null;
  selectedOfficeId:   number | null = null;

  // Special dropdowns
  selectedAllocationType:  string       = '';
  selectedBillType:        string       = 'both';
  selectedSearchType:      string | null = null;
  selectedManufacturerId:  number | null = null;   // stores manufacturer Id

  // Month/Year
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear:  number = new Date().getFullYear();

  // Free text
  searchValue:   string = '';
  vehicleNumber:  string = '';

  // ── Static Option Lists ──────────────────────────────────────────────────
  searchTypeOptions     = SEARCH_TYPE_OPTIONS;
  allocationTypeOptions = ALLOCATION_TYPE_OPTIONS;
  monthOptions          = MONTH_OPTIONS;
  yearOptions           = buildYearList();

  // Bill type options change depending on which report is active
  activeBillTypeOptions = computed<{ value: string; label: string }[]>(() => {
    const cfg = this.config();
    if (!cfg) return BILL_TYPE_OPTIONS_POL;
    return cfg.backendStrategy === 'IncorrectOdometer'
      ? BILL_TYPE_OPTIONS_ODOMETER
      : BILL_TYPE_OPTIONS_POL;
  });

  // ── Table Columns ────────────────────────────────────────────────────────
  tableColumns = computed<TableColumn[]>(() => {
    // Sr. No. is always the first column in every report
    const srNoColumn: TableColumn = {
      key: 'SrNo',
      label: 'Sr. No.',
      sortable: false,
      width: '70px',
      textAlign: 'center'
    };

    const dataCols = this.columns().map(col => {
      let label = col
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, s => s.toUpperCase())
        .trim();

      // Fix common acronyms
      label = label.replace(/\bDdo\b/g, 'DDO')
                   .replace(/\bIfms\b/g, 'IFMS')
                   .replace(/\bGrn\b/g, 'GRN')
                   .replace(/\bPol\b/g, 'POL');

      return { key: col, label, sortable: true };
    });

    return this.columns().length > 0 ? [srNoColumn, ...dataCols] : [];
  });

  // ── Constructor ──────────────────────────────────────────────────────────
  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const reportId = params.get('reportId');
      if (reportId && REPORT_CONFIGS[reportId]) {
        this.initializeReport(REPORT_CONFIGS[reportId]);
      } else {
        this.title.set('Report Not Found');
        this.subtitle.set('The requested report configuration does not exist.');
        this.config.set(null);
        this.data.set([]);
      }
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  initializeReport(cfg: ReportConfig): void {
    this.config.set(cfg);
    this.title.set(cfg.title);
    this.subtitle.set(cfg.subtitle);

    // Reset all filter values
    this.selectedDeptId        = null;
    this.selectedDistrictId    = null;
    this.selectedOfficeId      = null;
    this.selectedAllocationType = '';
    this.selectedBillType      = cfg.backendStrategy === 'IncorrectOdometer' ? 'fuel' : 'both';
    this.selectedSearchType    = null;
    this.selectedManufacturerId = null;
    this.searchValue            = '';
    this.vehicleNumber          = '';
    this.fromDate              = getFYStart();
    this.toDate                = getFYEnd();
    this.clientSearchTerm.set('');
    this.data.set([]);
    this.columns.set([]);

    // Load master data as needed
    if (cfg.filters.showDept) {
      this.loadDepartments();
    }
    if (cfg.filters.showDistrict) {
      this.loadDistricts();
    }
    if (cfg.filters.showManufacturerDropdown) {
      this.loadManufacturers();
    }

    // Auto-generate for reports that don't need a manual trigger
    // (Reports with SearchType/Manufacturer need explicit user action)
    const needsExplicitTrigger =
      cfg.filters.showSearchTypeDropdown ||
      cfg.filters.showManufacturerDropdown;

    if (!needsExplicitTrigger) {
      this.generateReport();
    }
  }

  // ── Master Data Loaders ───────────────────────────────────────────────────
  loadDepartments(): void {
    this.apiService.get<any[]>('/masters/departments')
      .subscribe(res => this.departments.set(res));
  }

  loadDistricts(): void {
    this.apiService.get<any[]>('/masters/districts')
      .subscribe(res => this.districts.set(res));
  }

  loadManufacturers(): void {
    // Returns DropdownResponseDto: [ { id, name } ]
    this.apiService.get<any[]>('/masters/manufacturers')
      .subscribe(res => this.manufacturers.set(res));
  }

  // ── Event Handlers ────────────────────────────────────────────────────────
  onDeptChange(): void {
    this.selectedOfficeId = null;
    if (this.config()?.filters.showOffice) {
      const endpoint = this.selectedDeptId
        ? `/masters/offices?departmentId=${this.selectedDeptId}`
        : `/masters/offices`;
      this.apiService.get<any[]>(endpoint).subscribe(res => this.offices.set(res));
    }
  }

  handleRowClick(row: any): void {
    // Determine which field holds the vehicle ID. Usually it is id, vehicleId, or fuelMaintenanceIFMSId
    const vId = row.vehicleId || row.id || row.fuelMaintenanceIFMSId;
    const regNo = row.registrationNumber || row.registration_number || row.vehicleNumber || row.vehicle_number || '';

    if (vId) {
      this.selectedVehicleId.set(vId);
      this.selectedVehicleRegistration.set(regNo);
      this.showVehicleModal.set(true);
    }
  }

  // ── Generate Report ───────────────────────────────────────────────────────
  generateReport(): void {
    const activeConfig = this.config();
    if (!activeConfig) return;

    this.isLoading.set(true);

    // Build the filter payload based on what this report needs
    const filters: Record<string, any> = {};

    if (activeConfig.filters.showDateRange) {
      filters['fromDate'] = this.fromDate;
      filters['toDate']   = this.toDate;
    }
    if (activeConfig.filters.showDept)     filters['deptId']     = this.selectedDeptId;
    if (activeConfig.filters.showDistrict) filters['districtId'] = this.selectedDistrictId;
    if (activeConfig.filters.showOffice)   filters['officeId']   = this.selectedOfficeId;

    if (activeConfig.filters.showAllocationTypeDropdown) {
      filters['allocationType'] = this.selectedAllocationType || null;
    }
    if (activeConfig.filters.showBillTypeDropdown) {
      filters['billType'] = this.selectedBillType;
    }
    if (activeConfig.filters.showMonthYear) {
      filters['month'] = this.selectedMonth;
      filters['year']  = this.selectedYear;
    }
    if (activeConfig.filters.showSearchTypeDropdown) {
      filters['searchType'] = this.selectedSearchType;
    }
    if (activeConfig.filters.showSearchValueInput) {
      filters['searchValue'] = this.searchValue?.trim() || null;
    }
    if (activeConfig.filters.showManufacturerDropdown) {
      filters['manufacturerId'] = this.selectedManufacturerId;
    }
    if (activeConfig.filters.showVehicleNumber) {
      filters['vehicleNumber'] = this.vehicleNumber?.trim() || null;
    }

    // Merge any static defaultFilters from config
    if (activeConfig.defaultFilters) {
      Object.assign(filters, activeConfig.defaultFilters);
    }

    const payload = {
      reportType: activeConfig.backendStrategy,
      filters
    };

    this.apiService.post<any>('/reports/generate-report', payload).subscribe({
      next: (res) => {
        if (res.title) this.title.set(res.title);
        this.columns.set(res.headers || []);
        this.data.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.data.set([]);
      }
    });
  }

  // ── Export PDF ────────────────────────────────────────────────────────────
  exportPdf(): void {
    const dataset = this.filteredData();
    if (!dataset || dataset.length === 0) return;

    const cols = this.tableColumns();
    const headers = cols.map(c => c.label);

    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(16);
    doc.text(this.title(), 14, 15);
    
    // Add subtitle if exists
    if (this.subtitle()) {
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(this.subtitle(), 14, 22);
    }

    const bodyData = dataset.map(row => 
      cols.map(col => {
        let cell = row[col.key];
        return cell === null || cell === undefined ? '' : String(cell);
      })
    );

    autoTable(doc, {
      head: [headers],
      body: bodyData,
      startY: this.subtitle() ? 28 : 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [4, 30, 73] } // Dark blue header
    });

    const fileName = `${this.title().replace(/\s+/g, '_')}_Export.pdf`;
    doc.save(fileName);
  }

  // ── Export Excel ──────────────────────────────────────────────────────────
  exportExcel(): void {
    const dataset = this.filteredData();
    if (!dataset || dataset.length === 0) return;

    const cols = this.tableColumns();
    
    const excelData = dataset.map(row => {
      const newRow: any = {};
      cols.forEach(col => {
        newRow[col.label] = row[col.key] === null || row[col.key] === undefined ? '' : row[col.key];
      });
      return newRow;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Report': worksheet }, SheetNames: ['Report'] };
    
    XLSX.writeFile(workbook, `${this.title().replace(/\s+/g, '_')}_Export.xlsx`);
  }
}
