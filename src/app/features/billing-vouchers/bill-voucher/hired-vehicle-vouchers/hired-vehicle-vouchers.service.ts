import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/services/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface HiredVehicleBill {
  hiredVehicleBillId: number;
  billNumber: string;
  billDate: string;
  vehicleNumber: string;
  officeName: string;
  contractorName: string;
  contractorPhone: string;
  vehicleType: string;
  noOfVehicles: number;
  hiredFrom: string;
  hiredTo: string;
  kmCovered: number;
  amount: number;
  status: number;
  claimId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class HiredVehicleVouchersService {
  private api = inject(ApiService);

  getVouchers(claimId?: number): Observable<HiredVehicleBill[]> {
    const url = claimId ? `Billing/hired?claimId=${claimId}` : 'Billing/hired';
    return this.api.get<{ success: boolean, result: HiredVehicleBill[] }>(url).pipe(
      map(res => res.result)
    );
  }

  saveVoucher(voucher: Partial<HiredVehicleBill>): Observable<any> {
    return this.api.post('Billing/hired', voucher);
  }

  deleteVoucher(id: number): Observable<boolean> {
    return this.api.delete<{ success: boolean }>(`Billing/hired/${id}`).pipe(
      map(res => res.success)
    );
  }

  createClaim(payload: any): Observable<any> {
    return this.api.post('Billing/claims', payload);
  }
}
