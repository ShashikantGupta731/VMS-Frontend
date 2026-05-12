import { Component, signal, computed, effect } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { VehicleDetailsService, VehicleDetails } from './vehicle-details.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { KeyValueListComponent, KeyValueItem } from '@shared/components/ui/app-key-value-list/key-value-list.component';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AppCardComponent, AppButtonComponent, AppInputComponent, KeyValueListComponent],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss'
})
export class VehicleDetailsComponent {
  registrationNumber = signal<string | undefined>(undefined);
  
  private detailResource = rxResource<VehicleDetails | null, string | undefined>({
    params: () => this.registrationNumber(),
    stream: ({ params }) => params ? this.vehicleDetailsService.getVehicleDetails(params) : of(null)
  });

  vehicleDetails = computed(() => this.detailResource.value() ?? null);
  isLoading = this.detailResource.isLoading;

  totalVehicleCount = signal(0);
  searchTerm = '';
  hasPrevious = false;
  hasNext = false;

  // Key-value items organized by section
  officeDetails = signal<KeyValueItem[]>([]);
  allocationDetails = signal<KeyValueItem[]>([]);
  driverDetails = signal<KeyValueItem[]>([]);
  vehicleDetailsKvItems = signal<KeyValueItem[]>([]);
  usageStatusDetails = signal<KeyValueItem[]>([]);
  financialDetails = signal<KeyValueItem[]>([]);
  purchaseDetails = signal<KeyValueItem[]>([]);

  constructor(private vehicleDetailsService: VehicleDetailsService) {
    this.loadTotalCount();
    effect(() => {
      const data = this.vehicleDetails();
      if (data) {
        this.populateKeyValueItems(data);
      }
    });
  }

  loadTotalCount(): void {
    this.vehicleDetailsService.getTotalVehicleCount().subscribe({
      next: (count) => {
        this.totalVehicleCount.set(count);
      },
      error: (error) => {
        console.error('Error loading total count:', error);
      }
    });
  }

  populateKeyValueItems(vehicle: VehicleDetails): void {
    this.officeDetails.set([
      { label: 'Office Name', value: vehicle.officeName },
      { label: 'Office Address', value: vehicle.officeAddress, isMultiline: true },
      { label: 'District', value: vehicle.district },
      { label: 'Tehsil', value: vehicle.tehsil },
      { label: 'Department', value: vehicle.department },
      { label: 'Allocation Type', value: vehicle.allocationType }
    ]);

    this.allocationDetails.set([
      { label: 'Allocated to (Officer)', value: vehicle.officerName },
      { label: 'Allocated to (Designation)', value: vehicle.designation }
    ]);

    this.driverDetails.set([
      { label: 'Driver Type', value: vehicle.driverType },
      { label: 'Driver Name', value: vehicle.driverName },
      { label: 'Driver Contact', value: vehicle.driverContact }
    ]);

    this.vehicleDetailsKvItems.set([
      { label: 'Vehicle Type', value: vehicle.vehicleType },
      { label: 'Manufacturer', value: vehicle.manufacturer },
      { label: 'Make / Model', value: vehicle.model },
      { label: 'Manufacture Year', value: vehicle.manufactureYear },
      { label: 'Seating Capacity', value: vehicle.seatingCapacity },
      { label: 'Fuel Used', value: vehicle.fuelUsed }
    ]);

    this.usageStatusDetails.set([
      { label: 'KM covered', value: `${vehicle.kmCovered} (as of ${this.formatDate(vehicle.kmDate)})` },
      { label: 'Current Status', value: vehicle.currentStatus },
      { label: 'Is Tyres Original', value: vehicle.isTyreOriginal, format: 'boolean' }
    ]);

    this.financialDetails.set([
      { label: 'Fuel Consumption (Rs)', value: vehicle.fuelCost, format: 'currency' },
      { label: 'Fuel Consumption (Litres)', value: vehicle.fuelLitres },
      { label: 'Maintenance Cost', value: vehicle.maintenanceCost, format: 'currency' }
    ]);

    this.purchaseDetails.set([
      { label: 'Vehicle Purchase Date', value: vehicle.purchaseDate, format: 'date' },
      { label: 'Vehicle Cost', value: vehicle.vehicleCost, format: 'currency' },
      { label: 'Chassis No.', value: vehicle.chassisNumber }
    ]);
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.vehicleDetailsService.searchByRegistrationNumber(this.searchTerm).subscribe({
        next: (results) => {
          if (results.length > 0) {
            this.registrationNumber.set(results[0].registrationNumber);
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
          this.registrationNumber.set(vehicle.registrationNumber);
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
          this.registrationNumber.set(vehicle.registrationNumber);
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
