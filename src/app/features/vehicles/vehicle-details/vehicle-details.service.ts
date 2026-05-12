import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface VehicleDetails {
  registrationNumber: string;
  ddoCode: string;
  officeName: string;
  officeAddress: string;
  district: string;
  tehsil: string;
  department: string;
  allocationType: string;
  officerName: string;
  designation: string;
  driverType: string;
  driverName: string;
  driverContact: string;
  vehicleType: string;
  manufacturer: string;
  model: string;
  manufactureYear: number;
  seatingCapacity: number;
  fuelUsed: string;
  kmCovered: number;
  kmDate: string;
  currentStatus: string;
  isTyreOriginal: boolean;
  fuelCost: number;
  fuelLitres: number;
  maintenanceCost: number;
  purchaseDate: string;
  vehicleCost: number;
  chassisNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleDetailsService {
  private mockVehicles: VehicleDetails[] = [
    {
      registrationNumber: 'PB-10-AB-1234',
      ddoCode: 'DDO-001',
      officeName: 'Regional Transport Office',
      officeAddress: 'Ferozepur Road, Ludhiana, Punjab',
      district: 'Ludhiana',
      tehsil: 'Ludhiana',
      department: 'Transport',
      allocationType: 'Pool Vehicle',
      officerName: 'John Smith',
      designation: 'Regional Officer',
      driverType: 'Permanent',
      driverName: 'Raj Kumar',
      driverContact: '+91-98765-43210',
      vehicleType: 'SUV',
      manufacturer: 'Toyota',
      model: 'Innova',
      manufactureYear: 2022,
      seatingCapacity: 7,
      fuelUsed: 'Diesel',
      kmCovered: 45000,
      kmDate: '2024-01-15',
      currentStatus: 'Active',
      isTyreOriginal: true,
      fuelCost: 45000,
      fuelLitres: 1200,
      maintenanceCost: 15000,
      purchaseDate: '2022-03-15',
      vehicleCost: 1850000,
      chassisNumber: 'MHK12345678901234'
    },
    {
      registrationNumber: 'PB-10-CD-5678',
      ddoCode: 'DDO-002',
      officeName: 'Civil Hospital',
      officeAddress: 'Mall Road, Amritsar, Punjab',
      district: 'Amritsar',
      tehsil: 'Amritsar',
      department: 'Health',
      allocationType: 'Assigned Vehicle',
      officerName: 'Jane Doe',
      designation: 'Medical Officer',
      driverType: 'Contract',
      driverName: 'Singh Singh',
      driverContact: '+91-87654-32109',
      vehicleType: 'Hatchback',
      manufacturer: 'Maruti Suzuki',
      model: 'Swift',
      manufactureYear: 2021,
      seatingCapacity: 5,
      fuelUsed: 'Petrol',
      kmCovered: 32000,
      kmDate: '2024-01-10',
      currentStatus: 'Active',
      isTyreOriginal: false,
      fuelCost: 32000,
      fuelLitres: 800,
      maintenanceCost: 12000,
      purchaseDate: '2021-06-20',
      vehicleCost: 650000,
      chassisNumber: 'MAK98765432109876'
    }
  ];

  private currentIndex = 0;

  getVehicleDetails(registrationNumber?: string): Observable<VehicleDetails | null> {
    // Simulate API delay
    if (registrationNumber) {
      const vehicle = this.mockVehicles.find(v => v.registrationNumber === registrationNumber);
      return of(vehicle || null);
    }
    return of(this.mockVehicles[this.currentIndex]);
  }

  searchByRegistrationNumber(searchTerm: string): Observable<VehicleDetails[]> {
    const filtered = this.mockVehicles.filter(v =>
      v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filtered);
  }

  getTotalVehicleCount(): Observable<number> {
    return of(this.mockVehicles.length);
  }

  getNextVehicle(): Observable<VehicleDetails | null> {
    if (this.currentIndex < this.mockVehicles.length - 1) {
      this.currentIndex++;
      return of(this.mockVehicles[this.currentIndex]);
    }
    return of(null);
  }

  getPreviousVehicle(): Observable<VehicleDetails | null> {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return of(this.mockVehicles[this.currentIndex]);
    }
    return of(null);
  }

  setCurrentIndex(index: number): void {
    this.currentIndex = index;
  }
}
