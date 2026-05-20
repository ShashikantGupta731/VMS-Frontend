import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/services/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MiscellaneousBill } from '@shared/services/billing.service';

@Injectable({
  providedIn: 'root'
})
export class MiscellaneousStoreVouchersService {
  private api = inject(ApiService);

  /**
   * Fetches the list of miscellaneous store bills.
   * If claimId is provided, it fetches bills for that claim.
   * Otherwise, it fetches drafted bills.
   */
  getVouchers(claimId?: number): Observable<MiscellaneousBill[]> {
    const url = claimId ? `Billing/miscellaneous?claimId=${claimId}` : 'Billing/miscellaneous';
    return this.api.get<{ success: boolean, result: MiscellaneousBill[] }>(url).pipe(
      map(res => res.result)
    );
  }

  /**
   * Deletes a drafted miscellaneous bill.
   */
  deleteVoucher(id: number): Observable<boolean> {
    return this.api.delete<{ success: boolean }>(`Billing/miscellaneous/${id}`).pipe(
      map(res => res.success)
    );
  }
}
