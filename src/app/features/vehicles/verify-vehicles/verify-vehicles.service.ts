import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5261/api/vehicles';

  getVehiclesByStatus(status: 'pending' | 'objection' | 'verified'): Observable<VerifyVehicle[]> {
    const statusMap: Record<string, number> = {
      'pending': 0,
      'verified': 1,
      'objection': 2
    };

    return this.http.get<any[]>(`${this.apiUrl}?status=${statusMap[status]}`).pipe(
      map(vehicles => vehicles.map(v => this.mapToVerifyVehicle(v)))
    );
  }

  verifyVehicle(id: number): Observable<boolean> {
    return this.http.post(`${this.apiUrl}/${id}/verify`, {}).pipe(
      map(() => true)
    );
  }

  raiseObjection(id: number, comments: string = 'Objection raised by Admin'): Observable<boolean> {
    return this.http.post(`${this.apiUrl}/${id}/reject`, { comments }).pipe(
      map(() => true)
    );
  }

  resolveObjection(id: number): Observable<boolean> {
    return this.verifyVehicle(id);
  }

  private mapToVerifyVehicle(v: any): VerifyVehicle {
    const statusRevMap: Record<number, 'pending' | 'objection' | 'verified'> = {
      0: 'pending',
      1: 'verified',
      2: 'objection'
    };

    return {
      id: v.id,
      department: v.department,
      district: v.district || 'Punjab',
      state: 'Punjab',
      tehsil: v.tehsil || '',
      officeName: v.officeName,
      officeAddress: v.officeAddress || '',
      officerName: v.officerName,
      designation: v.designation,
      manufacturer: v.manufacturer,
      model: v.model,
      manufactureYear: parseInt(v.manufactureYear),
      vehicleType: v.vehicleType,
      vehicleNumber: v.registrationNumber,
      seatingCapacity: v.seatingCapacity,
      fuelUsed: v.fuelUsed,
      fitnessUpto: v.fitnessUpto,
      engineOrChassisNo: v.chassisNumber,
      currentStatus: v.currentStatus,
      verificationStatus: statusRevMap[v.verificationStatus] || 'pending',
      verificationDate: v.verificationDate
    };
  }
}
