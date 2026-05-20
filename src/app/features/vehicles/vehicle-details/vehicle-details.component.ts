import { Component, signal, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleDetailsService, VehicleDetails } from './vehicle-details.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { KeyValueItem } from '@shared/components/ui/app-key-value-list/key-value-list.component';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AppCardComponent, AppButtonComponent, AppInputComponent],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss'
})
export class VehicleDetailsComponent {
  // Index of currently displayed vehicle
  currentIndex = signal<number>(0);
  searchTerm = '';

  // RxResource to load list of all accessible vehicles on page init
  private vehiclesResource = rxResource<VehicleDetails[], undefined>({
    stream: () => this.vehicleDetailsService.loadVehicles()
  });

  vehiclesList = computed(() => this.vehiclesResource.value() ?? []);
  isLoading = this.vehiclesResource.isLoading;

  // Selected vehicle details derived from current list and index
  vehicleDetails = computed<VehicleDetails | null>(() => this.vehiclesList()[this.currentIndex()] ?? null);
  totalVehicleCount = computed(() => this.vehiclesList().length);

  // Pagination states
  hasPrevious = computed(() => this.currentIndex() > 0);
  hasNext = computed(() => this.currentIndex() < this.totalVehicleCount() - 1);

  // Key-value items organized by section, dynamically derived from selected vehicle
  officeDetails = computed<KeyValueItem[]>(() => {
    const vehicle = this.vehicleDetails();
    if (!vehicle) return [];
    return [
      { label: 'Office Name', value: vehicle.officeName },
      { label: 'Office Address', value: vehicle.officeAddress, isMultiline: true },
      { label: 'District', value: vehicle.district },
      { label: 'Tehsil', value: vehicle.tehsil },
      { label: 'Department', value: vehicle.department },
      { label: 'Allocation Type', value: vehicle.allocationType }
    ];
  });

  allocationDetails = computed<KeyValueItem[]>(() => {
    const vehicle = this.vehicleDetails();
    if (!vehicle) return [];
    return [
      { label: 'Allocated to (Officer)', value: vehicle.officerName },
      { label: 'Allocated to (Designation)', value: vehicle.designation }
    ];
  });

  driverDetails = computed<KeyValueItem[]>(() => {
    const vehicle = this.vehicleDetails();
    if (!vehicle) return [];
    return [
      { label: 'Driver Type', value: vehicle.driverType },
      { label: 'Driver Name', value: vehicle.driverName },
      { label: 'Driver Contact', value: vehicle.driverContact }
    ];
  });

  vehicleDetailsKvItems = computed<KeyValueItem[]>(() => {
    const vehicle = this.vehicleDetails();
    if (!vehicle) return [];
    return [
      { label: 'Vehicle Type', value: vehicle.vehicleType },
      { label: 'Manufacturer', value: vehicle.manufacturer },
      { label: 'Make / Model', value: vehicle.model },
      { label: 'Manufacture Year', value: vehicle.manufactureYear },
      { label: 'Seating Capacity', value: vehicle.seatingCapacity },
      { label: 'Fuel Used', value: vehicle.fuelUsed }
    ];
  });

  usageStatusDetails = computed<KeyValueItem[]>(() => {
    const vehicle = this.vehicleDetails();
    if (!vehicle) return [];
    return [
      { label: 'KM covered', value: `${vehicle.kmCovered} (as of ${this.formatDate(vehicle.kmDate)})` },
      { label: 'Current Status', value: vehicle.currentStatus },
      { label: 'Is Tyres Original', value: vehicle.isTyreOriginal, format: 'boolean' }
    ];
  });

  financialDetails = computed<KeyValueItem[]>(() => {
    const vehicle = this.vehicleDetails();
    if (!vehicle) return [];
    return [
      { label: 'Fuel Consumption (Rs)', value: vehicle.fuelCost, format: 'currency' },
      { label: 'Fuel Consumption (Litres)', value: vehicle.fuelLitres },
      { label: 'Maintenance Cost', value: vehicle.maintenanceCost, format: 'currency' }
    ];
  });

  purchaseDetails = computed<KeyValueItem[]>(() => {
    const vehicle = this.vehicleDetails();
    if (!vehicle) return [];
    return [
      { label: 'Vehicle Purchase Date', value: vehicle.purchaseDate, format: 'date' },
      { label: 'Vehicle Cost', value: vehicle.vehicleCost, format: 'currency' },
      { label: 'Chassis No.', value: vehicle.chassisNumber }
    ];
  });

  constructor(private vehicleDetailsService: VehicleDetailsService) {}

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      const matchIndex = this.vehiclesList().findIndex(v =>
        v.registrationNumber.toLowerCase().includes(term)
      );
      if (matchIndex !== -1) {
        this.currentIndex.set(matchIndex);
      } else {
        console.warn(`No vehicle found matching: ${this.searchTerm}`);
      }
    }
  }

  onPrevious(): void {
    if (this.hasPrevious()) {
      this.currentIndex.update(i => i - 1);
    }
  }

  onNext(): void {
    if (this.hasNext()) {
      this.currentIndex.update(i => i + 1);
    }
  }

  onExportPdf(): void {
    console.log('Export to PDF');
    window.print();
  }

  onPrint(): void {
    window.print();
  }

  formatValue(item: KeyValueItem): string {
    const value = item.value;
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    switch (item.format) {
      case 'currency':
        return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'date':
        return this.formatDateString(value as string);
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }

  private formatDateString(dateString: string): string {
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

  private formatDate(dateString: string): string {
    if (!dateString || dateString === 'N/A') return 'N/A';
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
