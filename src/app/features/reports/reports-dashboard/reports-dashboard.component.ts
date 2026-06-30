import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '@core/services/api';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppDataTableComponent],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.scss'
})
export class ReportsDashboardComponent implements OnInit {
  stats = signal<any>({
    unverified: 0,
    odometerIssues: 0,
    totalVehicles: 0
  });

  tableColumns: TableColumn[] = [
    { key: 'srNo', label: '#', width: '60px' },
    { key: 'title', label: 'Report Name', width: '35%' },
    { key: 'desc', label: 'Description' }
  ];

  tableActions: TableAction[] = [
    {
      label: 'View',
      icon: '<i class="pi pi-eye"></i>',
      variant: 'dark-blue',
      action: (row: any) => {
        this.router.navigate(['/reports/view', row.id]);
      }
    }
  ];

  reportCategories = signal<any[]>([
    {
      title: 'Vehicle Overview',
      isOpen: true,
      reports: [
        { srNo: 1, id: '1-department-wise', title: 'Vehicles - Department Wise', desc: 'Aggregate vehicle status counts per department.' },
        { srNo: 2, id: '2-grn-details', title: 'Vehicles - GRN Details', desc: 'Detailed GRN records and amounts for vehicles.' },
        { srNo: 3, id: '3-designation-fuel-limit', title: 'Designation Wise Fuel Limit', desc: 'Approved fuel/maintenance limits per designation.' },
        { srNo: 4, id: '4-search-vehicle', title: 'Search by Vehicle No./Officer', desc: 'Search for specific vehicles across dimensions.' },
        { srNo: 5, id: '5-search-manufacturer', title: 'Search by Manufacturer/Model', desc: 'Search for vehicles by specific manufacturers.' },
        { srNo: 6, id: '6-model-category-wise', title: 'Vehicles - Model Category Wise', desc: 'Count of vehicles grouped by manufacturer and model.' },
        { srNo: 7, id: '7-allocation-type-wise', title: 'Vehicles - Allocation Type Wise', desc: 'Distribution of vehicles by Earmarked/Pooled.' },
        { srNo: 8, id: '8-enrolled-verified', title: 'Vehicles - Enrolled & Verified', desc: 'List of vehicles that are enrolled and verified.' }
      ]
    },
    {
      title: 'Compliance & Financials',
      isOpen: false,
      reports: [
        { srNo: 1, id: '9-unverified', title: 'Vehicles - Unverified', desc: 'Audit of vehicles pending verification.' },
        { srNo: 2, id: '10-not-in-use-condemned', title: 'Vehicles - Not In Use / Condemned', desc: 'List of vehicles not in use or condemned.' },
        { srNo: 3, id: '11-voucher-type-wise', title: 'Bills Submitted - Voucher Type Wise', desc: 'Consolidated view of financial vouchers submitted.' },
        { srNo: 4, id: '12-expenditure-fy', title: 'Expenditure - Financial Year Wise', desc: 'Month-by-month financial year comparison.' },
        { srNo: 5, id: '23-allocation-wise-billing', title: 'No. of Bills & Amount - Allocation Type', desc: 'Consolidated billing grouped by allocation type.' },
        { srNo: 6, id: '13-fuel-limit-exceeded', title: 'Vehicles Exceeded Fuel Limits', desc: 'Vehicles exceeding their allotted fuel limits.' },
        { srNo: 7, id: '14-not-posting-pol', title: 'Vehicles Not Posting Bills Under POL', desc: 'Active vehicles missing recent fuel entries.' },
        { srNo: 8, id: '15-incorrect-odometer', title: 'Incorrect Odometer Reading/Bill Date', desc: 'Vehicles with potential reading discrepancies.' }
      ]
    },
    {
      title: 'Administrative & Geographical',
      isOpen: false,
      reports: [
        { srNo: 1, id: '16-officer-multiple-vehicles', title: 'Officers Having Multiple Vehicles', desc: 'Audit of personnel assigned more than one vehicle.' },
        { srNo: 2, id: '17-ddos-not-mapped', title: 'DDOs Not Mapped To Any Nodal Officer', desc: 'DDOs missing nodal officer mappings.' },
        { srNo: 3, id: '18-tehsils-not-provided', title: 'Tehsils Not Provided Vehicle Data', desc: 'Administrative regions without any assigned vehicles.' },
        { srNo: 4, id: '19-district-wise', title: 'Vehicles - District Wise', desc: 'Total vehicle counts per district.' },
        { srNo: 5, id: '20-office-wise', title: 'Vehicles - Office Wise', desc: 'Total vehicle counts per office.' },
        { srNo: 6, id: '21-designation-wise', title: 'Vehicles - Designation Wise', desc: 'Total vehicle counts per designation.' },
        { srNo: 7, id: '22-condemned', title: 'Vehicles - Condemned', desc: 'List of vehicles strictly marked as condemned.' }
      ]
    }
  ]);

  toggleCategory(index: number) {
    this.reportCategories.update(categories => {
      categories[index].isOpen = !categories[index].isOpen;
      return [...categories];
    });
  }

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // Unverified
    this.apiService.get<any[]>('/reports/unverified').subscribe(data => {
      const total = data.reduce((acc, curr) => acc + curr.unverifiedCount, 0);
      this.stats.update(s => ({ ...s, unverified: total }));
    });

    // Odometer
    this.apiService.get<any[]>('/reports/odometer-issues').subscribe(data => {
      const total = data.reduce((acc, curr) => acc + curr.issues, 0);
      this.stats.update(s => ({ ...s, odometerIssues: total }));
    });

    // Dept Wise (for total)
    this.apiService.get<any[]>('/reports/dept-wise').subscribe(data => {
      const total = data.reduce((acc, curr) => acc + curr.totalVehicles, 0);
      this.stats.update(s => ({ ...s, totalVehicles: total }));
    });
  }
}
