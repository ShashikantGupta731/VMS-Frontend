import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface VerifyVehicle {
  id: number;
  department: string;
  district: string;
  state: string;
  tehsil: string;
  officeName: string;
  officeAddress: string;
  officerName: string;
  designation: string;
  manufacturer: string;
  model: string;
  manufactureYear: number;
  vehicleType: string;
  vehicleNumber: string;
  seatingCapacity: number;
  fuelUsed: string;
  fitnessUpto: string;
  engineOrChassisNo: string;
  currentStatus: string;
  verificationStatus: 'pending' | 'objection' | 'verified';
  verificationDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class VerifyVehiclesService {
  private mockData: VerifyVehicle[] = [
    {
      id: 1,
      department: 'Transport',
      district: 'Ludhiana',
      state: 'Punjab',
      tehsil: 'Ludhiana',
      officeName: 'Regional Transport Office',
      officeAddress: 'Ferozepur Road, Ludhiana',
      officerName: 'John Smith',
      designation: 'Regional Officer',
      manufacturer: 'Toyota',
      model: 'Innova',
      manufactureYear: 2022,
      vehicleType: 'SUV',
      vehicleNumber: 'PB-10-AB-1234',
      seatingCapacity: 7,
      fuelUsed: 'Diesel',
      fitnessUpto: '2025-12-31',
      engineOrChassisNo: 'MHK12345678901234',
      currentStatus: 'Active',
      verificationStatus: 'pending',
      verificationDate: ''
    },
    {
      id: 2,
      department: 'Health',
      district: 'Amritsar',
      state: 'Punjab',
      tehsil: 'Amritsar',
      officeName: 'Civil Hospital',
      officeAddress: 'Mall Road, Amritsar',
      officerName: 'Jane Doe',
      designation: 'Medical Officer',
      manufacturer: 'Maruti Suzuki',
      model: 'Swift',
      manufactureYear: 2021,
      vehicleType: 'Hatchback',
      vehicleNumber: 'PB-10-CD-5678',
      seatingCapacity: 5,
      fuelUsed: 'Petrol',
      fitnessUpto: '2024-06-30',
      engineOrChassisNo: 'MAK98765432109876',
      currentStatus: 'Active',
      verificationStatus: 'objection',
      verificationDate: '2024-01-15'
    },
    {
      id: 3,
      department: 'Police',
      district: 'Jalandhar',
      state: 'Punjab',
      tehsil: 'Jalandhar',
      officeName: 'Police Station',
      officeAddress: 'Civil Lines, Jalandhar',
      officerName: 'Robert Johnson',
      designation: 'Station House Officer',
      manufacturer: 'Mahindra',
      model: 'Scorpio',
      manufactureYear: 2023,
      vehicleType: 'SUV',
      vehicleNumber: 'PB-10-EF-9012',
      seatingCapacity: 7,
      fuelUsed: 'Diesel',
      fitnessUpto: '2026-03-31',
      engineOrChassisNo: 'MND11223344556677',
      currentStatus: 'Active',
      verificationStatus: 'verified',
      verificationDate: '2024-02-20'
    },
    {
      id: 4,
      department: 'Education',
      district: 'Patiala',
      state: 'Punjab',
      tehsil: 'Patiala',
      officeName: 'District Education Office',
      officeAddress: 'Shergarh, Patiala',
      officerName: 'Emily Brown',
      designation: 'District Education Officer',
      manufacturer: 'Hyundai',
      model: 'Creta',
      manufactureYear: 2022,
      vehicleType: 'SUV',
      vehicleNumber: 'PB-10-GH-3456',
      seatingCapacity: 5,
      fuelUsed: 'Diesel',
      fitnessUpto: '2025-09-30',
      engineOrChassisNo: 'HYN77889900112233',
      currentStatus: 'Active',
      verificationStatus: 'pending',
      verificationDate: ''
    },
    {
      id: 5,
      department: 'Revenue',
      district: 'Ferozepur',
      state: 'Punjab',
      tehsil: 'Ferozepur',
      officeName: 'Tehsil Office',
      officeAddress: 'Court Road, Ferozepur',
      officerName: 'Michael Wilson',
      designation: 'Tehsildar',
      manufacturer: 'Tata',
      model: 'Nexon',
      manufactureYear: 2023,
      vehicleType: 'SUV',
      vehicleNumber: 'PB-10-IJ-7890',
      seatingCapacity: 5,
      fuelUsed: 'Petrol',
      fitnessUpto: '2026-01-31',
      engineOrChassisNo: 'TTA44556677889900',
      currentStatus: 'Active',
      verificationStatus: 'objection',
      verificationDate: '2024-03-10'
    }
  ];

  getVehiclesByStatus(status: 'pending' | 'objection' | 'verified'): Observable<VerifyVehicle[]> {
    // Simulate API delay
    return of(this.mockData.filter(vehicle => vehicle.verificationStatus === status));
  }

  verifyVehicle(id: number): Observable<boolean> {
    const vehicle = this.mockData.find(v => v.id === id);
    if (vehicle) {
      vehicle.verificationStatus = 'verified';
      vehicle.verificationDate = new Date().toISOString().split('T')[0];
    }
    return of(true);
  }

  raiseObjection(id: number): Observable<boolean> {
    const vehicle = this.mockData.find(v => v.id === id);
    if (vehicle) {
      vehicle.verificationStatus = 'objection';
      vehicle.verificationDate = new Date().toISOString().split('T')[0];
    }
    return of(true);
  }

  resolveObjection(id: number): Observable<boolean> {
    const vehicle = this.mockData.find(v => v.id === id);
    if (vehicle) {
      vehicle.verificationStatus = 'verified';
      vehicle.verificationDate = new Date().toISOString().split('T')[0];
    }
    return of(true);
  }
}
