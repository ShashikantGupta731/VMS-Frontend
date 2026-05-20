import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@core/services/api';
import { AuthService } from '@core/services/auth';

export interface VehicleDetails {
  id?: number;
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
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  /**
   * Loads the list of vehicles from backend API.
   * Uses DDO-filtered endpoint if the user has DDO role,
   * otherwise gets all vehicles for administrative roles.
   */
  loadVehicles(): Observable<VehicleDetails[]> {
    const isDdo = this.authService.hasRole('DDO') && !this.authService.hasRole('ADMN');
    const endpoint = isDdo ? 'Billing/vehicles' : 'Vehicles';

    console.log(`[VehicleDetailsService] Loading vehicles from endpoint: ${endpoint}`);

    return this.apiService.get<any>(endpoint).pipe(
      map(response => {
        // Handle both raw array response and wrapped result response
        const rawList = response?.result || response || [];
        if (!Array.isArray(rawList)) {
          console.warn('[VehicleDetailsService] API did not return an array list:', response);
          return [];
        }
        return rawList.map(v => this.mapResponseToDetails(v));
      })
    );
  }

  /**
   * Maps backend VehicleResponseDto to frontend VehicleDetails structure
   */
  private mapResponseToDetails(v: any): VehicleDetails {
    return {
      id: v.id,
      registrationNumber: v.registrationNumber || 'N/A',
      ddoCode: v.ddoCode || 'N/A',
      officeName: v.officeName || 'N/A',
      officeAddress: v.officeAddress || 'N/A',
      district: v.district || 'N/A',
      tehsil: v.tehsil || 'N/A',
      department: v.department || 'N/A',
      allocationType: v.vehicleAllocationType || 'N/A',
      officerName: v.officerName || 'N/A',
      designation: v.designation || 'N/A',
      driverType: v.driverType || 'N/A',
      driverName: v.driverName || 'N/A',
      driverContact: v.driverContactNumber || 'N/A',
      vehicleType: v.vehicleType || 'N/A',
      manufacturer: v.manufacturer || 'N/A',
      model: v.model || 'N/A',
      manufactureYear: parseInt(v.manufactureYear) || 0,
      seatingCapacity: v.seatingCapacity || 0,
      fuelUsed: v.fuelUsed || 'N/A',
      kmCovered: v.kmsCovered || 0,
      kmDate: v.createdAt || 'N/A',
      currentStatus: v.currentStatus || 'N/A',
      isTyreOriginal: v.isTyreOriginal === 'Yes',
      fuelCost: v.fuelCostLast3Months || 0,
      fuelLitres: v.fuelLitresLast3Months || 0,
      maintenanceCost: v.maintenanceCostLast3Months || 0,
      purchaseDate: v.purchaseDate || '',
      vehicleCost: v.vehicleCost || 0,
      chassisNumber: v.chassisNumber || 'N/A'
    };
  }
}
