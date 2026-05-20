import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '@core/services/api';

export interface Bill {
  claimNumber: string;
  amount: number;
  subVoucherNo: string;
  sanctionOrderNo: string;
  sanctionAuthority: string;
  sanctionOrderDate: string;
  claimFor: string;
  postDate: string;
  selected?: boolean;
  fuelMaintenanceIFMSId?: number;
  fuelMaintenance?: number;
  incomeTaxAmount?: number;
  vmsRefNo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SendBillsService {
  private apiService = inject(ApiService);

  constructor() {}

  getBills(): Observable<Bill[]> {
    return this.apiService.post<any>('BillIntegration/GetBillsForSubmission', '').pipe(
      map(res => {
        if (res && res.success && res.result) {
          return res.result.map((b: any) => {
            let claimForText = 'Other';
            if (b.fuelMaintenance === 1 || b.fuelMaintenance === '1') claimForText = 'Fuel';
            else if (b.fuelMaintenance === 2 || b.fuelMaintenance === '2') claimForText = 'Maintenance';
            else if (b.fuelMaintenance === 3 || b.fuelMaintenance === '3') claimForText = 'Hired Vehicle';
            else if (b.fuelMaintenance === 4 || b.fuelMaintenance === '4') claimForText = 'Misc. Store';
            else if (b.fuelMaintenance === 5 || b.fuelMaintenance === '5') claimForText = 'Contractual / Requisite Vehicle';

            return {
              claimNumber: b.claimNo || '',
              amount: b.amount || 0,
              subVoucherNo: b.subVoucherNo || '',
              sanctionOrderNo: b.sanctionOrderNo || '',
              sanctionAuthority: b.sanctionAuthority || '',
              sanctionOrderDate: b.sanctionOrderDate || '',
              claimFor: claimForText,
              postDate: b.pDate || b.actionDate || '',
              selected: false,
              fuelMaintenanceIFMSId: b.fuelMaintenanceIFMSId,
              fuelMaintenance: b.fuelMaintenance,
              incomeTaxAmount: b.incomeTaxAmount,
              vmsRefNo: b.vmsRefNo
            };
          });
        }
        return [];
      }),
      catchError(err => {
        console.error('Error fetching bills from backend:', err);
        return of([]);
      })
    );
  }

  processBills(bills: Bill[]): Observable<{ message: string; processedCount: number }> {
    // Process selected bills (mock or connect to real integration postbill later if needed)
    return of({
      message: 'Bills successfully processed and sent to IFMS',
      processedCount: bills.length,
    });
  }

  getBTDetails(): Observable<any> {
    return this.apiService.post<any>('BillIntegration/GetBTDetails', {});
  }

  getPayees(ddoCode: string): Observable<any> {
    return this.apiService.post<any>('BillIntegration/GetPayees', { ddo_code: ddoCode });
  }

  getBudgetHeads(ddoCode: string, classOfExp: string, budgetTypeCode: number): Observable<any> {
    return this.apiService.post<any>('BillIntegration/GetBudgetHeads', {
      ddo_code: ddoCode,
      class_of_exp: classOfExp,
      budget_type_code: budgetTypeCode
    });
  }

  sendBillsToIfms(payload: any): Observable<any> {
    return this.apiService.post<any>('BillIntegration/SendBillsToIfms', payload);
  }
}
