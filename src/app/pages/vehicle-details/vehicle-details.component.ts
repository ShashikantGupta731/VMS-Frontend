import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleDetailsService, VehicleDetails } from './vehicle-details.service';
import { AppCardComponent } from '../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../shared/components/ui/app-button/button.component';
import { AppInputComponent } from '../../shared/components/ui/app-input/input.component';
import { KeyValueListComponent, KeyValueItem } from '../../shared/components/ui/app-key-value-list/key-value-list.component';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AppCardComponent, AppButtonComponent, AppInputComponent, KeyValueListComponent],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss'
})
export class VehicleDetailsComponent implements OnInit {
  vehicleDetails: VehicleDetails | null = null;
  totalVehicleCount = 0;
  isLoading = false;
  searchTerm = '';
  hasPrevious = false;
  hasNext = false;

  // Key-value items organized by section
  officeDetails: KeyValueItem[] = [];
  allocationDetails: KeyValueItem[] = [];
  driverDetails: KeyValueItem[] = [];
  vehicleDetailsKvItems: KeyValueItem[] = [];
  usageStatusDetails: KeyValueItem[] = [];
  financialDetails: KeyValueItem[] = [];
  purchaseDetails: KeyValueItem[] = [];

  constructor(private vehicleDetailsService: VehicleDetailsService) {}

  ngOnInit(): void {
    this.loadVehicleDetails();
    this.loadTotalCount();
  }

  loadVehicleDetails(registrationNumber?: string): void {
    this.isLoading = true;
    this.vehicleDetailsService.getVehicleDetails(registrationNumber).subscribe({
      next: (data) => {
        this.vehicleDetails = data;
        if (data) {
          this.populateKeyValueItems(data);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vehicle details:', error);
        this.isLoading = false;
      }
    });
  }

  loadTotalCount(): void {
    this.vehicleDetailsService.getTotalVehicleCount().subscribe({
      next: (count) => {
        this.totalVehicleCount = count;
      },
      error: (error) => {
        console.error('Error loading total count:', error);
      }
    });
  }

  populateKeyValueItems(vehicle: VehicleDetails): void {
    this.officeDetails = [
      { label: 'Office Name', value: vehicle.officeName },
      { label: 'Office Address', value: vehicle.officeAddress, isMultiline: true },
      { label: 'District', value: vehicle.district },
      { label: 'Tehsil', value: vehicle.tehsil },
      { label: 'Department', value: vehicle.department },
      { label: 'Allocation Type', value: vehicle.allocationType }
    ];

    this.allocationDetails = [
      { label: 'Allocated to (Officer)', value: vehicle.officerName },
      { label: 'Allocated to (Designation)', value: vehicle.designation }
    ];

    this.driverDetails = [
      { label: 'Driver Type', value: vehicle.driverType },
      { label: 'Driver Name', value: vehicle.driverName },
      { label: 'Driver Contact', value: vehicle.driverContact }
    ];

    this.vehicleDetailsKvItems = [
      { label: 'Vehicle Type', value: vehicle.vehicleType },
      { label: 'Manufacturer', value: vehicle.manufacturer },
      { label: 'Make / Model', value: vehicle.model },
      { label: 'Manufacture Year', value: vehicle.manufactureYear },
      { label: 'Seating Capacity', value: vehicle.seatingCapacity },
      { label: 'Fuel Used', value: vehicle.fuelUsed }
    ];

    this.usageStatusDetails = [
      { label: 'KM covered', value: `${vehicle.kmCovered} (as of ${this.formatDate(vehicle.kmDate)})` },
      { label: 'Current Status', value: vehicle.currentStatus },
      { label: 'Is Tyres Original', value: vehicle.isTyreOriginal, format: 'boolean' }
    ];

    this.financialDetails = [
      { label: 'Fuel Consumption (Rs)', value: vehicle.fuelCost, format: 'currency' },
      { label: 'Fuel Consumption (Litres)', value: vehicle.fuelLitres },
      { label: 'Maintenance Cost', value: vehicle.maintenanceCost, format: 'currency' }
    ];

    this.purchaseDetails = [
      { label: 'Vehicle Purchase Date', value: vehicle.purchaseDate, format: 'date' },
      { label: 'Vehicle Cost', value: vehicle.vehicleCost, format: 'currency' },
      { label: 'Chassis No.', value: vehicle.chassisNumber }
    ];
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.vehicleDetailsService.searchByRegistrationNumber(this.searchTerm).subscribe({
        next: (results) => {
          if (results.length > 0) {
            this.loadVehicleDetails(results[0].registrationNumber);
          }
        },
        error: (error) => {
          console.error('Error searching vehicles:', error);
        }
      });
    }
  }

  onPrevious(): void {
    this.vehicleDetailsService.getPreviousVehicle().subscribe({
      next: (vehicle) => {
        if (vehicle) {
          this.vehicleDetails = vehicle;
          this.populateKeyValueItems(vehicle);
        }
      },
      error: (error) => {
        console.error('Error loading previous vehicle:', error);
      }
    });
  }

  onNext(): void {
    this.vehicleDetailsService.getNextVehicle().subscribe({
      next: (vehicle) => {
        if (vehicle) {
          this.vehicleDetails = vehicle;
          this.populateKeyValueItems(vehicle);
        }
      },
      error: (error) => {
        console.error('Error loading next vehicle:', error);
      }
    });
  }

  onExportPdf(): void {
    console.log('Export to PDF');
    // TODO: Implement PDF export
  }

  onPrint(): void {
    window.print();
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  }
}
