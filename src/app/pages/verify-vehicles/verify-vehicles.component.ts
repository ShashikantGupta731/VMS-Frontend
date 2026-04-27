import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VerifyVehiclesService, VerifyVehicle } from './verify-vehicles.service';
import { AppCardComponent } from '../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '../../shared/components/ui/app-data-table/data-table.component';

@Component({
  selector: 'app-verify-vehicles',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppDataTableComponent],
  templateUrl: './verify-vehicles.component.html',
  styleUrl: './verify-vehicles.component.scss'
})
export class VerifyVehiclesComponent implements OnInit {
  selectedStatus: 'pending' | 'objection' | 'verified' = 'pending';
  vehicles: VerifyVehicle[] = [];
  isLoading = false;

  statusOptions = [
    { value: 'pending' as const, label: 'Pending' },
    { value: 'objection' as const, label: 'Objection' },
    { value: 'verified' as const, label: 'Verified' }
  ];

  // Table columns
  tableColumns: TableColumn[] = [
    { key: 'id', label: '#', width: '60px', textAlign: 'center' },
    { key: 'location', label: 'Department / District / State / Tehsil', width: '200px', allowHtml: true },
    { key: 'officeDetails', label: 'Office Details', width: '250px', allowHtml: true },
    { key: 'vehicleDetails', label: 'Vehicle Details', width: '250px', allowHtml: true },
    { key: 'fuelStatus', label: 'Fuel & Status', width: '200px', allowHtml: true },
    { key: 'verification', label: 'Verification Status / Date', width: '180px', allowHtml: true }
  ];

  constructor(private verifyVehiclesService: VerifyVehiclesService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  onStatusChange(status: 'pending' | 'objection' | 'verified'): void {
    this.selectedStatus = status;
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.verifyVehiclesService.getVehiclesByStatus(this.selectedStatus).subscribe({
      next: (data) => {
        this.vehicles = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.isLoading = false;
      }
    });
  }

  verifyVehicle(vehicle: VerifyVehicle): void {
    this.verifyVehiclesService.verifyVehicle(vehicle.id).subscribe({
      next: () => {
        this.loadVehicles();
      },
      error: (error) => {
        console.error('Error verifying vehicle:', error);
      }
    });
  }

  raiseObjection(vehicle: VerifyVehicle): void {
    this.verifyVehiclesService.raiseObjection(vehicle.id).subscribe({
      next: () => {
        this.loadVehicles();
      },
      error: (error) => {
        console.error('Error raising objection:', error);
      }
    });
  }

  resolveObjection(vehicle: VerifyVehicle): void {
    this.verifyVehiclesService.resolveObjection(vehicle.id).subscribe({
      next: () => {
        this.loadVehicles();
      },
      error: (error) => {
        console.error('Error resolving objection:', error);
      }
    });
  }

  viewDetails(vehicle: VerifyVehicle): void {
    console.log('View details:', vehicle);
    // TODO: Implement view details modal or navigation
  }

  viewObjection(vehicle: VerifyVehicle): void {
    console.log('View objection:', vehicle);
    // TODO: Implement view objection modal
  }

  getActionsForStatus(status: 'pending' | 'objection' | 'verified'): TableAction[] {
    switch (status) {
      case 'pending':
        return [
          {
            label: 'Verify',
            action: (row: VerifyVehicle) => this.verifyVehicle(row),
            variant: 'primary'
          },
          {
            label: 'Raise Objection',
            action: (row: VerifyVehicle) => this.raiseObjection(row),
            variant: 'secondary'
          }
        ];
      case 'objection':
        return [
          {
            label: 'View Objection',
            action: (row: VerifyVehicle) => this.viewObjection(row),
            variant: 'default'
          },
          {
            label: 'Resolve',
            action: (row: VerifyVehicle) => this.resolveObjection(row),
            variant: 'primary'
          }
        ];
      case 'verified':
        return [
          {
            label: 'View Details',
            action: (row: VerifyVehicle) => this.viewDetails(row),
            variant: 'default'
          }
        ];
      default:
        return [];
    }
  }

  getFormattedVehicle(vehicle: VerifyVehicle): any {
    return {
      id: vehicle.id,
      location: this.formatLocation(vehicle),
      officeDetails: this.formatOfficeDetails(vehicle),
      vehicleDetails: this.formatVehicleDetails(vehicle),
      fuelStatus: this.formatFuelStatus(vehicle),
      verification: this.formatVerification(vehicle)
    };
  }

  private formatLocation(vehicle: VerifyVehicle): string {
    return `<div class="multi-line-cell">
      <div><strong>Department:</strong> ${vehicle.department}</div>
      <div><strong>District:</strong> ${vehicle.district}</div>
      <div><strong>State:</strong> ${vehicle.state}</div>
      <div><strong>Tehsil:</strong> ${vehicle.tehsil}</div>
    </div>`;
  }

  private formatOfficeDetails(vehicle: VerifyVehicle): string {
    return `<div class="multi-line-cell">
      <div><strong>Office:</strong> ${vehicle.officeName}</div>
      <div><strong>Address:</strong> ${vehicle.officeAddress}</div>
      <div><strong>Officer:</strong> ${vehicle.officerName}</div>
      <div><strong>Designation:</strong> ${vehicle.designation}</div>
    </div>`;
  }

  private formatVehicleDetails(vehicle: VerifyVehicle): string {
    return `<div class="multi-line-cell">
      <div><strong>Manufacturer:</strong> ${vehicle.manufacturer}</div>
      <div><strong>Model:</strong> ${vehicle.model}</div>
      <div><strong>Year:</strong> ${vehicle.manufactureYear}</div>
      <div><strong>Type:</strong> ${vehicle.vehicleType}</div>
      <div><strong>Vehicle No:</strong> ${vehicle.vehicleNumber}</div>
      <div><strong>Seating:</strong> ${vehicle.seatingCapacity}</div>
    </div>`;
  }

  private formatFuelStatus(vehicle: VerifyVehicle): string {
    return `<div class="multi-line-cell">
      <div><strong>Fuel:</strong> ${vehicle.fuelUsed}</div>
      <div><strong>Fitness Upto:</strong> ${vehicle.fitnessUpto}</div>
      <div><strong>Engine/Chassis:</strong> ${vehicle.engineOrChassisNo}</div>
      <div><strong>Status:</strong> ${vehicle.currentStatus}</div>
    </div>`;
  }

  private formatVerification(vehicle: VerifyVehicle): string {
    return `<div class="multi-line-cell">
      <div><strong>Status:</strong> ${this.getStatusBadge(vehicle.verificationStatus)}</div>
      <div><strong>Date:</strong> ${vehicle.verificationDate || 'N/A'}</div>
    </div>`;
  }

  private getStatusBadge(status: string): string {
    const badgeClass = `badge-${status.toLowerCase()}`;
    return `<span class="status-badge ${badgeClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
  }

  getFormattedVehicles(): any[] {
    return this.vehicles.map(vehicle => this.getFormattedVehicle(vehicle));
  }
}
