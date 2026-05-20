import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/services/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FuelVoucher {
  fuelBillId: number;
  vehicleId: number;
  vehicleNumber: string;
  billNumber: string;
  billDate: string;
  odometerReading: number;
  fuelQuantity: number;
  amount: number;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class FuelVouchersService {
  private api = inject(ApiService);

  getVouchers(claimId?: number): Observable<FuelVoucher[]> {
    const url = claimId ? `Billing/fuel?claimId=${claimId}` : 'Billing/fuel';
    return this.api.get<{ success: boolean, result: FuelVoucher[] }>(url).pipe(
      map(res => res.result)
    );
  }

  saveVoucher(voucher: Partial<FuelVoucher>): Observable<any> {
    return this.api.post('Billing/fuel', voucher);
  }

  deleteVoucher(id: number): Observable<boolean> {
    return this.api.delete<{ success: boolean }>(`Billing/fuel/${id}`).pipe(
      map(res => res.success)
    );
  }

  getOdometerValidation(vehicleId: number, billDate: string): Observable<any> {
    return this.api.get(`Billing/validate-odometer/${vehicleId}?billDate=${billDate}`);
  }

  getDdoVehicles(): Observable<any[]> {
    return this.api.get<{ success: boolean, result: any[] }>('Billing/vehicles').pipe(
      map(res => res.result)
    );
  }

  checkFitness(vehicleId: number, odometer: number): Observable<boolean> {
    return this.api.get<{ success: boolean, required: boolean }>(`Billing/check-fitness/${vehicleId}?odometer=${odometer}`).pipe(
      map(res => res.required)
    );
  }

  checkPermission(vehicleId: number, value: number): Observable<boolean> {
    return this.api.get<{ success: boolean, required: boolean }>(`Billing/check-permission/${vehicleId}?type=1&value=${value}`).pipe(
      map(res => res.required)
    );
  }

  createClaim(payload: any): Observable<any> {
    return this.api.post('Billing/claims', payload);
  }
}
