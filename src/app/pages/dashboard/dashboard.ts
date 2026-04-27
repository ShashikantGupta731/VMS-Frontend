import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppCardComponent } from '../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../shared/components/ui/app-button/button.component';
import { AppInputComponent } from '../../shared/components/ui/app-input/input.component';
import { AppPaginationComponent } from '../../shared/components/ui/app-pagination/pagination.component';
import { AppDropdownComponent, DropdownItem } from '../../shared/components/ui/app-dropdown/dropdown.component';
import { VehicleDetailsModalComponent } from '../../shared/components/vehicle-details-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppInputComponent, AppPaginationComponent, AppDropdownComponent, VehicleDetailsModalComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  constructor(private router: Router) {}

  // Modal state
  showVehicleDetailsModal = false;
  selectedVehicleNumber = '';

  // Pagination state
  currentPage = 1;
  totalPages = 5;
  totalItems = 50;
  itemsPerPage = 10;

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

  // Table data
  tableData = [
    {
      vehicleNumber: 'PB-10-1234',
      departmentLocation: `<div>Transport</div><div>Ludhiana</div>`,
      officeInfo: `<div>Regional Transport Office</div><div>DDO: RTO-001, Ludhiana</div><div>Sh. Rajesh Kumar</div><div>Regional Transport Officer</div>`,
      vehicleDetails: `<div>PB-10-1234</div><div>Car</div><div>Swift Dzire</div><div>Maruti Suzuki</div><div>2020</div><div>5 Seats</div>`,
      fuelFitness: `<div>Petrol</div><div>31-Dec-2025</div><div>Engine: G12B-123456</div><div>In Use</div><div>Verified</div><div>State</div>`,
      status: 'Active',
      actions: `<div><button>Details</button></div><div><button>Edit (Restricted)</button></div><div><button>Transfer</button></div>`,
    },
    {
      vehicleNumber: 'PB-10-5678',
      departmentLocation: `<div>Health</div><div>Amritsar</div>`,
      officeInfo: `<div>Civil Hospital</div><div>DDO: CH-002, Amritsar</div><div>Dr. Priya Singh</div><div>Medical Superintendent</div>`,
      vehicleDetails: `<div>PB-10-5678</div><div>Ambulance</div><div>ICU Ventilator</div><div>Tata Motors</div><div>2021</div><div>4 Seats</div>`,
      fuelFitness: `<div>Diesel</div><div>15-Jun-2026</div><div>Engine: 4SP-789012</div><div>In Use</div><div>Verified</div><div>State</div>`,
      status: 'Active',
      actions: `<div><button>Details</button></div><div><button>Edit (Restricted)</button></div><div><button>Transfer</button></div>`,
    },
    {
      vehicleNumber: 'PB-10-9012',
      departmentLocation: `<div>Police</div><div>Jalandhar</div>`,
      officeInfo: `<div>City Police Station</div><div>DDO: CPS-003, Jalandhar</div><div>Sh. Vikram Singh</div><div>Station House Officer</div>`,
      vehicleDetails: `<div>PB-10-9012</div><div>Jeep</div><div>Thar CRDe</div><div>Mahindra</div><div>2019</div><div>6 Seats</div>`,
      fuelFitness: `<div>Diesel</div><div>01-Jan-2025</div><div>Engine: mHawk-345678</div><div>In Use</div><div>Verified</div><div>State</div>`,
      status: 'Expired',
      actions: `<div><button>Details</button></div><div><button>Edit (Restricted)</button></div><div><button>Transfer</button></div>`,
    },
  ];

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
      // Navigate to edit page
    } else if (action === 'Transfer') {
      // Handle transfer
    }
  }

  closeVehicleDetailsModal(): void {
    this.showVehicleDetailsModal = false;
    this.selectedVehicleNumber = '';
  }
}
