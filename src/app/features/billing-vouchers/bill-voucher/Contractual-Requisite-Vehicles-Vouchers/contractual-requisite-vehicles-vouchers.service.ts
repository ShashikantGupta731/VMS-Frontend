import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/services/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ContractualBill {
  contractualBillId: number;
  billNumber: string;
  billDate: string;
  billPeriodFrom: string;
  billPeriodTo: string;
  officeName: string;
  vehicleType: string;
  ddoCode: string;
  vehicleNumber: string;
  amount: number;
  status: number;
  claimId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContractualRequisiteVehiclesVouchersService {
  private api = inject(ApiService);

  getVouchers(claimId?: number): Observable<ContractualBill[]> {
    const url = claimId ? `Billing/contractual?claimId=${claimId}` : 'Billing/contractual';
    return this.api.get<{ success: boolean, result: ContractualBill[] }>(url).pipe(
      map(res => res.result)
    );
  }

  saveVoucher(voucher: Partial<ContractualBill>): Observable<any> {
    return this.api.post('Billing/contractual', voucher);
  }

  deleteVoucher(id: number): Observable<boolean> {
    return this.api.delete<{ success: boolean }>(`Billing/contractual/${id}`).pipe(
      map(res => res.success)
    );
  }

  createClaim(payload: any): Observable<any> {
    return this.api.post('Billing/claims', payload);
  }
}
