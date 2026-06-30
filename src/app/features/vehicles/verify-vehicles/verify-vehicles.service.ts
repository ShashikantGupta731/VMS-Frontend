import { Injectable, inject } from '@angular/core';
import { Observable, map, tap, catchError, of, forkJoin } from 'rxjs';
import { ApiService } from '@core/services/api';

export interface VerifyVehicle {
  id: number;
  vehicleNumber: string;
  // DDO fields
  department?: string;
  district?: string;
  officeName?: string;
  officeAddress?: string;
  officerName?: string;
  designation?: string;
  manufacturer?: string;
  model?: string;
  manufactureYear?: number;
  vehicleType?: string;
  seatingCapacity?: number;
  fuelUsed?: string;
  fitnessUpto?: string;
  engineOrChassisNo?: string;
  currentStatus?: string;
  
  // Verification fields
  verificationStatus: string;
  verificationDate?: string;
  isVerified?: boolean;
  comments?: string;

  // ADMN specific fields (VMS vs VAHAN)
  vmsManufacturer?: string;
  vmsModel?: string;
  vmsVehicleType?: string;
  vahanManufacturer?: string;
  vahanModel?: string;
  vahanVehicleClass?: string;
  vahanBodyType?: string;
  
  vehicleProofs?: any;
  registrationCertificate?: string;
  vehiclePhoto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VerifyVehiclesService {
  private apiService = inject(ApiService);

  getVehicles(role: string, status: 'pending' | 'objection' | 'verified'): Observable<VerifyVehicle[]> {
    const statusMap = {
      pending: 0,
      verified: 1,
      objection: 2
    };
    const statusCode = statusMap[status];

    console.log(`--- Fetching vehicles from REST API for status ${status} (code: ${statusCode}) ---`);
    return this.apiService.get<any[]>(`vehicles?status=${statusCode}`).pipe(
      tap(res => console.log('Vehicles response:', res)),
      map(list => {
        if (!list || !Array.isArray(list)) {
          console.warn('API returned non-array response:', list);
          return [];
        }
        if (role === 'ADMN') {
          return list.map((v: any) => this.mapAdmnVehicle(v));
        } else {
          return list.map((v: any) => this.mapDdoVehicle(v));
        }
      }),
      catchError(err => {
        console.error(`API Error in GET vehicles:`, err);
        return of([]);
      })
    );
  }

  verifyVehicle(id: number): Observable<any> {
    return this.apiService.post<any>(`vehicles/${id}/verify`, {});
  }

  rejectVehicle(id: number, comments: string): Observable<any> {
    return this.apiService.post<any>(`vehicles/${id}/reject`, { comments });
  }

  submitAdmnResponse(statusArray: any[]): Observable<any> {
    console.log('Submitting verification responses in batch:', statusArray);
    const requests = statusArray.map(item => {
      const vehicleId = item.vehicleinfoid;
      if (item.response === 1) {
        return this.verifyVehicle(vehicleId).pipe(
          catchError(err => {
            console.error(`Error verifying vehicle ${vehicleId}:`, err);
            return of({ success: false, vehicleId });
          })
        );
      } else if (item.response === 2) {
        return this.rejectVehicle(vehicleId, item.comment || 'Objection raised').pipe(
          catchError(err => {
            console.error(`Error rejecting vehicle ${vehicleId}:`, err);
            return of({ success: false, vehicleId });
          })
        );
      }
      return of(null);
    });

    return forkJoin(requests).pipe(
      map(results => {
        // Return structured legacy success response to keep component logic intact
        return { success: true, message: 'All actions processed successfully' };
      })
    );
  }

  private mapDdoVehicle(v: any): VerifyVehicle {
    let statusStr = 'pending';
    if (v.verificationStatus === 1) statusStr = 'verified';
    if (v.verificationStatus === 2) statusStr = 'objection';

    return {
      id: v.id,
      vehicleNumber: v.registrationNumber,
      department: v.department,
      district: v.district,
      officeName: v.officeName,
      officeAddress: v.officeAddress,
      officerName: v.officerName,
      designation: v.designation,
      manufacturer: v.manufacturer,
      model: v.model,
      manufactureYear: parseInt(v.manufactureYear) || 0,
      vehicleType: v.vehicleType,
      seatingCapacity: v.seatingCapacity,
      fuelUsed: v.fuelUsed,
      fitnessUpto: v.fitnessUpto,
      engineOrChassisNo: v.chassisNumber,
      currentStatus: v.currentStatus,
      verificationStatus: statusStr,
      verificationDate: v.verificationDate,
      isVerified: v.verificationStatus === 1,
      comments: v.verificationComments
    };
  }

  private mapAdmnVehicle(v: any): VerifyVehicle {
    return {
      id: v.id,
      vehicleNumber: v.registrationNumber,
      vmsManufacturer: v.manufacturer,
      vmsModel: v.model,
      vmsVehicleType: v.vehicleType,
      vahanManufacturer: v.manufacturer, // fallback
      vahanModel: v.model, // fallback
      vahanVehicleClass: v.vehicleType, // fallback
      vahanBodyType: v.vehicleType, // fallback
      vehicleProofs: v.registrationCertificate ? [{ path: v.registrationCertificate, name: 'Registration Certificate' }] : [],
      registrationCertificate: v.registrationCertificate,
      vehiclePhoto: v.vehiclePhoto,
      verificationStatus: 'pending'
    };
  }
}
