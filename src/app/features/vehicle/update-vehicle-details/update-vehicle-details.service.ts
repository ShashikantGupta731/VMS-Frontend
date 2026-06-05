import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

export interface VehicleSummary {
  id: number;
  vehicleNumber: string;
  makeModel: string;
  department: string;
  officerAllotted: string;
  fuelType: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateVehicleDetailsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vehicles`;

  searchVehicle(vehicleNumber: string): Observable<VehicleSummary | null> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(res => {
        if (res && Array.isArray(res)) {
          const v = res.find((x: any) => (x.registrationNumber || '').toLowerCase() === vehicleNumber.toLowerCase());
          if (v) {
            return {
              id: v.id,
              vehicleNumber: v.registrationNumber,
              makeModel: `${v.make || v.manufacturer || ''} ${v.model || ''}`.trim() || 'N/A',
              department: v.departmentName || v.department || 'N/A',
              officerAllotted: v.officerName || 'N/A',
              fuelType: v.fuelUsed || 'N/A',
              status: v.verificationStatus === 1 ? 'Verified' : 'Pending'
            };
          }
        }
        return null;
      })
    );
  }
}
