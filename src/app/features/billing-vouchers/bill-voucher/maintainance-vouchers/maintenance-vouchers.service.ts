import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/services/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MaintenanceBill {
  maintenanceBillId: number;
  vehicleId: number;
  vehicleNumber: string;
  billNumber: string;
  billDate: string;
  odometerReading: number;
  amount: number;
  maintenanceType: string;
  details: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceVouchersService {
  private api = inject(ApiService);

  getVouchers(claimId?: number): Observable<MaintenanceBill[]> {
    const url = claimId ? `Billing/maintenance?claimId=${claimId}` : 'Billing/maintenance';
    return this.api.get<{ success: boolean, result: MaintenanceBill[] }>(url).pipe(
      map(res => res.result)
    );
  }

  saveVoucher(voucher: Partial<MaintenanceBill>): Observable<any> {
    return this.api.post('Billing/maintenance', voucher);
  }

  deleteVoucher(id: number): Observable<boolean> {
    return this.api.delete<{ success: boolean }>(`Billing/maintenance/${id}`).pipe(
      map(res => res.success)
    );
  }

  createClaim(payload: any): Observable<any> {
    return this.api.post('Billing/claims', payload);
  }

  getOdometerValidation(vehicleId: number, billDate: string): Observable<any> {
    return this.api.get(`Billing/validate-odometer/${vehicleId}?billDate=${billDate}`);
  }

  getDdoVehicles(): Observable<any[]> {
    return this.api.get<{ success: boolean, result: any[] }>('Billing/vehicles').pipe(
      map(res => res.result)
    );
  }

  checkPermission(vehicleId: number, value: number): Observable<boolean> {
    return this.api.get<{ success: boolean, required: boolean }>(`Billing/check-permission/${vehicleId}?type=2&value=${value}`).pipe(
      map(res => res.required)
    );
  }
}
