/**
 * ReportFilterConfig
 * ------------------
 * Defines which filter controls appear for each report page.
 * Based on exact legacy screenshots for all 22 reports.
 */
export interface ReportFilterConfig {
  // Standard dropdowns (loaded from masters API)
  showDept: boolean;               // Department dropdown
  showDistrict: boolean;           // District dropdown (replaces showOffice for most reports)
  showOffice: boolean;             // Office dropdown (cascades from dept) - only for specific reports

  // Date range pickers
  showDateRange: boolean;          // From Date + To Date

  // Month/Year pickers (Vehicles Exceeded Fuel Limits)
  showMonthYear: boolean;

  // Special dropdowns
  showAllocationTypeDropdown: boolean;  // Unverified report
  showBillTypeDropdown: boolean;         // Not Posting Bills POL + Incorrect Odometer
  showSearchTypeDropdown: boolean;       // Search Vehicle by No/Officer/Designation
  showManufacturerDropdown: boolean;     // Search Vehicle by Manufacturer/Model

  // Free text search input (Search Vehicle)
  showSearchValueInput: boolean;

  // Vehicle Number free text
  showVehicleNumber: boolean;
}

export interface ReportConfig {
  title: string;
  subtitle: string;
  backendStrategy: string;
  filters: ReportFilterConfig;
  defaultFilters?: Record<string, string>;
}

// Reusable filter presets to avoid repetition
const DEPT_DISTRICT: ReportFilterConfig = {
  showDept: true, showDistrict: true, showOffice: false,
  showDateRange: false, showMonthYear: false,
  showAllocationTypeDropdown: false, showBillTypeDropdown: false,
  showSearchTypeDropdown: false, showManufacturerDropdown: false,
  showSearchValueInput: false, showVehicleNumber: false
};

const FILTER_ONLY: ReportFilterConfig = {
  showDept: false, showDistrict: false, showOffice: false,
  showDateRange: false, showMonthYear: false,
  showAllocationTypeDropdown: false, showBillTypeDropdown: false,
  showSearchTypeDropdown: false, showManufacturerDropdown: false,
  showSearchValueInput: false, showVehicleNumber: false
};

const DATE_DEPT_DISTRICT: ReportFilterConfig = {
  showDept: true, showDistrict: true, showOffice: false,
  showDateRange: true, showMonthYear: false,
  showAllocationTypeDropdown: false, showBillTypeDropdown: false,
  showSearchTypeDropdown: false, showManufacturerDropdown: false,
  showSearchValueInput: false, showVehicleNumber: false
};

export const REPORT_CONFIGS: Record<string, ReportConfig> = {

  // ─── REPORT 1 ──────────────────────────────────────────────────────────────
  '1-department-wise': {
    title: 'Vehicles - Department Wise',
    subtitle: 'Aggregate vehicle status counts per department',
    backendStrategy: 'DepartmentWise',
    filters: FILTER_ONLY
  },

  // ─── REPORT 2 ──────────────────────────────────────────────────────────────
  '2-grn-details': {
    title: 'Vehicles - GRN Details',
    subtitle: 'Detailed GRN records for vehicles',
    backendStrategy: 'GrnDetails',
    filters: FILTER_ONLY
  },

  // ─── REPORT 3 ──────────────────────────────────────────────────────────────
  '3-designation-fuel-limit': {
    title: 'Vehicles - Designation Wise Fuel Limit',
    subtitle: 'Master list of approved fuel/maintenance limits per designation',
    backendStrategy: 'DesignationWiseFuelLimit',
    filters: FILTER_ONLY
  },

  // ─── REPORT 4 ──────────────────────────────────────────────────────────────
  // Legacy: Search Type dropdown (Vehicle wise / Office wise / Designation wise)
  //         + Search Value text input
  '4-search-vehicle': {
    title: 'Search Vehicle by Vehicle No./Officer Name/Designation',
    subtitle: 'Search for specific vehicles by vehicle number, officer name or designation',
    backendStrategy: 'VehicleDetails',
    filters: {
      showDept: false, showDistrict: false, showOffice: false,
      showDateRange: false, showMonthYear: false,
      showAllocationTypeDropdown: false, showBillTypeDropdown: false,
      showSearchTypeDropdown: true,    // "-- Please select --" with Vehicle wise / Office wise / Designation wise
      showManufacturerDropdown: false,
      showSearchValueInput: true,      // "Enter Value" text box
      showVehicleNumber: false
    }
  },

  // ─── REPORT 5 ──────────────────────────────────────────────────────────────
  // Legacy: Manufacturer dropdown only (-- Please select --)
  '5-search-manufacturer': {
    title: 'Search Vehicle by Manufacturer/Model',
    subtitle: 'List of vehicle models grouped under the selected manufacturer',
    backendStrategy: 'VehicleModelData',
    filters: {
      showDept: false, showDistrict: false, showOffice: false,
      showDateRange: false, showMonthYear: false,
      showAllocationTypeDropdown: false, showBillTypeDropdown: false,
      showSearchTypeDropdown: false,
      showManufacturerDropdown: true,   // Manufacturer dropdown only
      showSearchValueInput: false,
      showVehicleNumber: false
    }
  },

  // ─── REPORT 6 ──────────────────────────────────────────────────────────────
  // Legacy: Department + District
  '6-model-category-wise': {
    title: 'Vehicles - Model Category Wise',
    subtitle: 'Count of vehicles grouped by manufacturer and model',
    backendStrategy: 'VehicleModelData',
    filters: DEPT_DISTRICT
  },

  // ─── REPORT 7 ──────────────────────────────────────────────────────────────
  // Legacy: Department + District
  '7-allocation-type-wise': {
    title: 'Vehicles - Allocation Type Wise',
    subtitle: 'Distribution of vehicles by Earmarked/Pooled assignments',
    backendStrategy: 'AllocationTypeWiseData',
    filters: DEPT_DISTRICT
  },

  // ─── REPORT 8 ──────────────────────────────────────────────────────────────
  // Legacy: FromDate + ToDate + Department + District
  '8-enrolled-verified': {
    title: 'Vehicles - Enrolled & Verified',
    subtitle: 'Department-wise count of enrolled and verified vehicles for a date range',
    backendStrategy: 'VerifiedUnverifiedVehicle',
    filters: DATE_DEPT_DISTRICT,
    defaultFilters: { status: 'Verified' }
  },

  // ─── REPORT 9 ──────────────────────────────────────────────────────────────
  // Legacy: Department + District + Allocation Type dropdown
  '9-unverified': {
    title: 'Vehicles - Unverified',
    subtitle: 'Department-wise list of vehicles pending verification',
    backendStrategy: 'VerifiedUnverifiedVehicle',
    filters: {
      ...DEPT_DISTRICT,
      showAllocationTypeDropdown: true  // Extra: Allocation Type (All / Earmarked / Pooled etc.)
    },
    defaultFilters: { status: 'Unverified' }
  },

  // ─── REPORT 10 ─────────────────────────────────────────────────────────────
  // Legacy: Same as Enrolled & Verified UI (FromDate + ToDate + Dept + District)
  '10-not-in-use-condemned': {
    title: 'Vehicles - Not In Use / Condemned',
    subtitle: 'Department-wise list of vehicles not in use or condemned',
    backendStrategy: 'CondemnedVehicle',
    filters: DATE_DEPT_DISTRICT,
    defaultFilters: { includeNotInUse: 'true' }
  },

  // ─── REPORT 11 ─────────────────────────────────────────────────────────────
  // Legacy: FromDate + ToDate + Department + District
  '11-voucher-type-wise': {
    title: 'Bills Submitted - Voucher Type Wise',
    subtitle: 'Consolidated view of financial vouchers submitted by department',
    backendStrategy: 'VoucherTypeBills',
    filters: DATE_DEPT_DISTRICT
  },

  // ─── REPORT 12 ─────────────────────────────────────────────────────────────
  // Legacy: Only filter input (no dropdowns)
  '12-expenditure-fy': {
    title: 'Expenditure - Financial Year Wise',
    subtitle: 'Month-by-month comparison of expenditure across two financial years',
    backendStrategy: 'FinancialYearExpenditure',
    filters: FILTER_ONLY
  },

  // ─── REPORT 13 ─────────────────────────────────────────────────────────────
  // Legacy: Select Month dropdown + Select Year dropdown
  '13-fuel-limit-exceeded': {
    title: 'Vehicles Exceeded Fuel Limits',
    subtitle: 'Vehicles that consumed fuel beyond their monthly designation limit',
    backendStrategy: 'FuelLimitExceeded',
    filters: {
      ...FILTER_ONLY,
      showMonthYear: true   // Month + Year dropdowns
    }
  },

  // ─── REPORT 14 ─────────────────────────────────────────────────────────────
  // Legacy: Department + District + Type dropdown (Vehicles not Posting Fuel / Maintenance / Both)
  '14-not-posting-pol': {
    title: 'Vehicles Not Posting Bills Under POL',
    subtitle: 'Active vehicles missing recent fuel/maintenance bill entries',
    backendStrategy: 'NotPostingUnderPOL',
    filters: {
      ...DEPT_DISTRICT,
      showBillTypeDropdown: true  // Type: "Vehicles not Pos..." etc.
    }
  },

  // ─── REPORT 15 ─────────────────────────────────────────────────────────────
  // Legacy: Department + District + Type dropdown (Fuel Claims / Maintenance Claims)
  '15-incorrect-odometer': {
    title: 'Vehicles with Incorrect Odometer Reading/Bill Date',
    subtitle: 'Vehicles with odometer readings entered before system go-live date',
    backendStrategy: 'IncorrectOdometer',
    filters: {
      ...DEPT_DISTRICT,
      showBillTypeDropdown: true  // Type: "Fuel Claims" / "Maintenance Claims"
    }
  },

  // ─── REPORT 16 ─────────────────────────────────────────────────────────────
  // Legacy: Department only (no district)
  '16-officer-multiple-vehicles': {
    title: 'Officers Having Multiple Vehicles',
    subtitle: 'Officers assigned more than one vehicle simultaneously',
    backendStrategy: 'OfficerMultipleVehicles',
    filters: {
      showDept: true, showDistrict: false, showOffice: false,
      showDateRange: false, showMonthYear: false,
      showAllocationTypeDropdown: false, showBillTypeDropdown: false,
      showSearchTypeDropdown: false, showManufacturerDropdown: false,
      showSearchValueInput: false, showVehicleNumber: false
    }
  },

  // ─── REPORT 17 ─────────────────────────────────────────────────────────────
  // Legacy: Department + District
  '17-ddos-not-mapped': {
    title: 'DDOs Not Mapped To Any Nodal Officer',
    subtitle: 'Drawing & Disbursing Officers without a nodal officer mapping',
    backendStrategy: 'DdosNotMapped',
    filters: DEPT_DISTRICT
  },

  // ─── REPORT 18 ─────────────────────────────────────────────────────────────
  // Legacy: Filter input only (no dropdowns)
  '18-tehsils-not-provided': {
    title: 'Tehsils Not Provided Vehicle Data',
    subtitle: 'Tehsils/administrative regions with no vehicle data submitted',
    backendStrategy: 'TehsilsWithNoVehicles',
    filters: FILTER_ONLY
  },

  // ─── REPORT 19 ─────────────────────────────────────────────────────────────
  // Legacy: Department + District
  '19-district-wise': {
    title: 'Vehicles - District Wise',
    subtitle: 'Total vehicle count per district with expandable department detail',
    backendStrategy: 'DistrictWise',
    filters: DEPT_DISTRICT
  },

  // ─── REPORT 20 ─────────────────────────────────────────────────────────────
  // Legacy: Department + District
  '20-office-wise': {
    title: 'Vehicles - Office Wise',
    subtitle: 'Total vehicle count per office with expandable details',
    backendStrategy: 'OfficeWise',
    filters: DEPT_DISTRICT
  },

  // ─── REPORT 21 ─────────────────────────────────────────────────────────────
  // Legacy: Department + District
  '21-designation-wise': {
    title: 'Vehicles - Designation Wise',
    subtitle: 'Total vehicle count per designation with expandable details',
    backendStrategy: 'DesignationWise',
    filters: DEPT_DISTRICT
  },

  // ─── REPORT 22 ─────────────────────────────────────────────────────────────
  // Legacy: FromDate + ToDate only (no dept/district dropdowns)
  '22-condemned': {
    title: 'Vehicles - Condemned',
    subtitle: 'Department-wise count of condemned vehicles within a date range',
    backendStrategy: 'CondemnedVehicle',
    filters: {
      showDept: false, showDistrict: false, showOffice: false,
      showDateRange: true,
      showMonthYear: false,
      showAllocationTypeDropdown: false, showBillTypeDropdown: false,
      showSearchTypeDropdown: false, showManufacturerDropdown: false,
      showSearchValueInput: false, showVehicleNumber: false
    }
  },

  // ─── REPORT 23 ─────────────────────────────────────────────────────────────
  '23-allocation-wise-billing': {
    title: 'No. of Bills & Amount - Allocation Type Wise',
    subtitle: 'Consolidated fuel and maintenance billing grouped by allocation type',
    backendStrategy: 'AllocationWiseBilling',
    filters: DEPT_DISTRICT
  }
};
