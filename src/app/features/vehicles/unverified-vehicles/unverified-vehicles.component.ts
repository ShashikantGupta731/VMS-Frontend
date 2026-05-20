import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { AppDataTableComponent, TableAction, TableColumn } from '@shared/components/ui/app-data-table/data-table.component';
import { VehicleDetailsModalComponent } from '@shared/components/vehicle-details-modal';
import { VehicleService } from '@shared/services/vehicle.service';
import { MasterService } from '@core/services/master';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-unverified-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AppCardComponent,
    AppButtonComponent,
    AppPaginationComponent,
    AppDataTableComponent,
    VehicleDetailsModalComponent
  ],
  templateUrl: './unverified-vehicles.component.html',
  styleUrl: './unverified-vehicles.component.scss'
})
export class UnverifiedVehiclesComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private masterService = inject(MasterService);

  // Data arrays
  allVehicles: any[] = [];
  filteredVehicles: any[] = [];
  
  // Dropdown options
  departmentOptions: { label: string; value: string }[] = [];
  districtOptions: { label: string; value: string }[] = [];
  allocationOptions: string[] = [
    'EARMARKED', 
    'POOL', 
    'CONTRACTUAL EARMARKED', 
    'CONTRACTUAL POOLED', 
    'REQUISITION EARMARKED', 
    'REQUISITION POOLED', 
    'PROJECT EARMARKED', 
    'PROJECT POOLED'
  ];

  // Filters state
  searchText = '';
  selectedDept = '';
  selectedDistrict = '';
  selectedAllocation = '';

  // Pagination state
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPagesCount = 1;

  // Modal state
  isDetailsModalVisible = false;
  selectedVehicleId: number | null = null;
  selectedVehicleRegNo = '';

  // Table loading state
  isLoading = false;

  // Table columns definition
  tableColumns: TableColumn[] = [
    { key: 'srNo', label: 'Sr. No.', width: '70px', textAlign: 'center' },
    { key: 'department', label: 'Department Name', sortable: true },
    { key: 'district', label: 'District', sortable: true },
    { key: 'officeName', label: 'Office Name', sortable: true },
    { key: 'ddoCode', label: 'DDO Code', sortable: true },
    { key: 'registrationNumber', label: 'Vehicle Number', sortable: true },
    { key: 'vehicleAllocationType', label: 'Allocation Type', sortable: true },
    { key: 'manufactureYear', label: 'Manufacturing Year', sortable: true }
  ];

  // Table action buttons definition
  tableActions: TableAction[] = [
    {
      label: 'Details',
      icon: 'pi pi-eye',
      variant: 'info',
      action: (row: any) => this.openDetailsModal(row)
    }
  ];

  ngOnInit(): void {
    this.loadMasters();
    this.loadVehicles();
  }

  loadMasters(): void {
    // Fetch departments
    this.masterService.getDepartments().subscribe({
      next: (data) => {
        this.departmentOptions = data.map(d => ({
          label: d.deptName,
          value: d.deptName
        }));
      },
      error: (err) => console.error('Failed to load departments:', err)
    });

    // Fetch districts
    this.masterService.getDistricts().subscribe({
      next: (data) => {
        this.districtOptions = data.map(d => ({
          label: d.name,
          value: d.name
        }));
      },
      error: (err) => console.error('Failed to load districts:', err)
    });
  }

  loadVehicles(): void {
    this.isLoading = true;
    // Status 0 represents "Pending" / "Unverified"
    this.vehicleService.getVehicles(0).subscribe({
      next: (data) => {
        this.allVehicles = data || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load unverified vehicles:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    
    this.filteredVehicles = this.allVehicles.filter(v => {
      // 1. Text Search (Registration Number or Office Name)
      const matchesSearch = !search || 
        v.registrationNumber?.toLowerCase().includes(search) ||
        v.officeName?.toLowerCase().includes(search);

      // 2. Department filter
      const matchesDept = !this.selectedDept || v.department === this.selectedDept;

      // 3. District filter
      const matchesDistrict = !this.selectedDistrict || v.district === this.selectedDistrict;

      // 4. Allocation type filter
      const matchesAllocation = !this.selectedAllocation || 
        v.vehicleAllocationType?.toUpperCase() === this.selectedAllocation.toUpperCase();

      return matchesSearch && matchesDept && matchesDistrict && matchesAllocation;
    });

    // Reset pagination to first page on filter change
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedDept = '';
    this.selectedDistrict = '';
    this.selectedAllocation = '';
    this.applyFilters();
  }

  updatePagination(): void {
    this.totalItems = this.filteredVehicles.length;
    this.totalPagesCount = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  getPaginatedVehicles(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    return this.filteredVehicles.slice(startIndex, endIndex).map((v, index) => ({
      ...v,
      srNo: startIndex + index + 1,
      // Map properties to match table column keys if different from backend properties
      registrationNumber: v.registrationNumber,
      department: v.department || 'N/A',
      district: v.district || 'N/A',
      officeName: v.officeName || 'N/A',
      ddoCode: v.ddoCode || 'N/A',
      vehicleAllocationType: v.vehicleAllocationType || 'N/A',
      manufactureYear: v.manufactureYear || 'N/A'
    }));
  }

  onPrint(): void {
    window.print();
  }

  onExportExcel(): void {
    if (this.filteredVehicles.length === 0) {
      return;
    }

    const headers = ['Sr. No.', 'Department Name', 'District', 'Office Name', 'DDO Code', 'Vehicle Number', 'Allocation Type', 'Manufacturing Year'];
    const rows = this.filteredVehicles.map((v, index) => [
      index + 1,
      v.department || 'N/A',
      v.district || 'N/A',
      v.officeName || 'N/A',
      v.ddoCode || 'N/A',
      v.registrationNumber || 'N/A',
      v.vehicleAllocationType || 'N/A',
      v.manufactureYear || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'unverified_vehicles_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openDetailsModal(row: any): void {
    this.selectedVehicleId = row.id;
    this.selectedVehicleRegNo = row.registrationNumber;
    this.isDetailsModalVisible = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalVisible = false;
    this.selectedVehicleId = null;
    this.selectedVehicleRegNo = '';
  }
}
