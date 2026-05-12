import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { AppDropdownComponent, DropdownItem } from '@shared/components/ui/app-dropdown/dropdown.component';
import { VehicleDetailsModalComponent } from '@shared/components/vehicle-details-modal';
import { VehicleTransferModalComponent } from '@shared/components/vehicle-transfer-modal/vehicle-transfer-modal.component';
import { VehicleCondemnationModalComponent } from '@shared/components/vehicle-condemnation-modal/vehicle-condemnation-modal.component';
import { AppDataTableComponent } from '@shared/components/ui/app-data-table/data-table.component';
import { VehicleService } from '@shared/services/vehicle.service';

export interface VehicleResponse {
  id: number;
  registrationNumber: string;
  chassisNumber: string;
  manufacturer: string;
  model: string;
  vehicleType: string;
  ddoCode: string;
  officerName: string;
  designation: string;
  department: string;
  officeName: string;
  fuelUsed: string;
  fitnessUpto: string;
  currentStatus: string;
  verificationStatus: number;
  seatingCapacity: number;
  manufactureYear: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppInputComponent, AppPaginationComponent, AppDropdownComponent, VehicleDetailsModalComponent, VehicleTransferModalComponent, VehicleCondemnationModalComponent, AppDataTableComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private vehicleService = inject(VehicleService);
  private router = inject(Router);

  // Modal state
  showVehicleDetailsModal = false;
  selectedVehicleNumber = '';
  selectedVehicleForTransfer: any = null;
  showTransferModal = false;
  selectedVehicleForCondemnation: any = null;
  showCondemnationModal = false;

  // Data fetching
  private vehiclesResource = rxResource<VehicleResponse[], unknown>({
    stream: () => this.vehicleService.getVehicles().pipe(
      catchError((error: any) => {
        console.error('Error fetching vehicles:', error);
        return of([]);
      })
    )
  });

  isLoading = this.vehiclesResource.isLoading;

  // Pagination state
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = computed(() => {
    try {
      return this.vehiclesResource.value()?.length ?? 0;
    } catch (error) {
      console.error('Error computing total items:', error);
      return 0;
    }
  });
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));

  // Dropdown items
  billVoucherItems: DropdownItem[] = [
    { label: 'Fuel Vouchers', value: 'fuel' },
    { label: 'Maintenance Vouchers', value: 'maintenance' },
    { label: 'Hired Vouchers', value: 'hired' },
    { label: 'Contractual / Requisite Vouchers', value: 'contractual' },
    { label: 'Miscellaneous Store Vouchers', value: 'miscellaneous' },
  ];

  downloadItems: DropdownItem[] = [
    { label: 'All Vehicles', value: 'All Vehicles' },
    { label: 'Unverified Vehicles', value: 'Unverified Vehicles' },
  ];

  tableColumns = [
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'departmentLocation', label: 'Department / Location', allowHtml: true },
    { key: 'officeInfo', label: 'Office Info', allowHtml: true },
    { key: 'vehicleDetails', label: 'Vehicle Details', allowHtml: true },
    { key: 'fuelFitness', label: 'Fuel / Fitness / Status', allowHtml: true },
  ];

  tableActions = [
    { label: 'Details', action: (row: any) => this.onAction('Details', row) },
    { label: 'Edit', action: (row: any) => this.onAction('Edit', row) },
    { label: 'Transfer', action: (row: any) => this.onAction('Transfer', row) },
    { 
      label: 'Condemn', 
      action: (row: any) => this.onAction('Condemn', row),
      disabled: (row: any) => row.original.currentStatus === 'CONDEMNED'
    },
  ];

  // Table data
  tableData = computed(() => {
    try {
      const vehicles = this.vehiclesResource.value() ?? [];
      return vehicles.map(v => ({
        vehicleNumber: v.registrationNumber,
        departmentLocation: `<div>${v.department}</div><div>${v.officeName}</div>`,
        officeInfo: `<div>${v.officeName}</div><div>DDO: ${v.ddoCode || 'N/A'}</div><div>${v.officerName}</div><div>${v.designation}</div>`,
        vehicleDetails: `<div>${v.registrationNumber}</div><div>${v.vehicleType}</div><div>${v.model}</div><div>${v.manufacturer}</div><div>${v.manufactureYear}</div><div>${v.seatingCapacity} Seats</div>`,
        fuelFitness: `<div>${v.fuelUsed}</div><div>${v.fitnessUpto || 'N/A'}</div><div>Engine: ${v.chassisNumber}</div><div>${v.currentStatus}</div><div>${v.verificationStatus === 1 ? 'Verified' : 'Pending'}</div><div>State</div>`,
        status: v.currentStatus === 'Active' ? 'Active' : 'Expired',
        original: v
      }));
    } catch (error) {
      console.error('Error computing table data:', error);
      return [];
    }
  });

  onBillVoucherSelect(item: DropdownItem): void {
    console.log('Selected:', item.value);
    // Handle dropdown item selection
    if (item.value === 'fuel') {
      this.router.navigate(['/bill-voucher']);
    } else if (item.value === 'maintenance') {
      this.router.navigate(['/maintenance-voucher']);
    } else if (item.value === 'hired') {
      this.router.navigate(['/hired-vehicle-voucher']);
    } else if (item.value === 'contractual') {
      this.router.navigate(['/contractual-requisite-vehicle-voucher']);
    } else if (item.value === 'miscellaneous') {
      this.router.navigate(['/miscellaneous-store-voucher']);
    }
  }

  onDownloadSelect(item: DropdownItem): void {
    console.log('Selected:', item.value);
    // Handle dropdown item selection
    if (item.value === 'All Vehicles') {
      this.router.navigate(['/vehicle-details']);
    } else if (item.value === 'Unverified Vehicles') {
      this.router.navigate(['/unverified-vehicles']);
    } 
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    console.log('Page changed to:', page);
    // Handle pagination
  }

  onAction(action: string, row: any): void {
    console.log(`${action} clicked for:`, row);
    // Handle action based on type
    if (action === 'Details') {
      this.selectedVehicleNumber = row.vehicleNumber;
      this.showVehicleDetailsModal = true;
    } else if (action === 'Edit') {
      this.router.navigate(['/vehicles/edit', row.original.id]);
    } else if (action === 'Transfer') {
      this.selectedVehicleForTransfer = row.original;
      this.showTransferModal = true;
    } else if (action === 'Condemn') {
      this.selectedVehicleForCondemnation = row.original;
      this.showCondemnationModal = true;
    }
  }

  onCondemnSuccess(): void {
    this.vehiclesResource.reload();
  }

  closeCondemnationModal(): void {
    this.showCondemnationModal = false;
    this.selectedVehicleForCondemnation = null;
  }

  onTransferSuccess(): void {
    // Refresh vehicle list
    this.vehiclesResource.reload();
  }

  closeTransferModal(): void {
    this.showTransferModal = false;
    this.selectedVehicleForTransfer = null;
  }

  closeVehicleDetailsModal(): void {
    this.showVehicleDetailsModal = false;
    this.selectedVehicleNumber = '';
  }
}
