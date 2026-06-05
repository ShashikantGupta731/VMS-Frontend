import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '@env/environment';

export interface CorrectableBill {
  id: number;
  type: number; // 1 = Fuel, 2 = Maintenance
  vehicleNumber: string;
  billNumber: string;
  billDate: string;
  odometerReading: number;
  amount: number;
  claimId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OdometerCorrectionService {
  private http = inject(HttpClient);
  private billingApiUrl = `${environment.apiUrl}/billing`;

  searchByClaimId(claimIdOrNumber: string | number): Observable<CorrectableBill[]> {
    const isNumber = !isNaN(Number(claimIdOrNumber));
    const endpoint = isNumber ? `${this.billingApiUrl}/claims/${claimIdOrNumber}` : `${this.billingApiUrl}/claims/by-number/${claimIdOrNumber}`;
    return this.http.get<{ success: boolean; result: any }>(endpoint).pipe(
      map(res => {
        const bills: CorrectableBill[] = [];
        if (res && res.success && res.result) {
          const r = res.result;
          if (r.type === 1 && r.fuelBills) {
            r.fuelBills.forEach((b: any) => {
              bills.push({
                id: b.fuelBillId,
                type: 1,
                vehicleNumber: b.vehicleNumber,
                billNumber: b.billNumber,
                billDate: b.billDate,
                odometerReading: b.odometerReading,
                amount: b.amount,
                claimId: r.billClaimId
              });
            });
          } else if (r.type === 2 && r.maintenanceBills) {
            r.maintenanceBills.forEach((b: any) => {
              bills.push({
                id: b.maintenanceBillId,
                type: 2,
                vehicleNumber: b.vehicleNumber,
                billNumber: b.billNumber,
                billDate: b.billDate,
                odometerReading: b.odometerReading,
                amount: b.amount,
                claimId: r.billClaimId
              });
            });
          }
        }
        return bills;
      })
    );
  }

  searchByRecordId(recordId: number): Observable<CorrectableBill[]> {
    return this.http.get<{ success: boolean; result: any[] }>(`${this.billingApiUrl}/bills/search?id=${recordId}`).pipe(
      map(res => {
        const bills: CorrectableBill[] = [];
        if (res && res.success && res.result) {
          res.result.forEach((r: any) => {
            bills.push({
              id: r.type === 1 ? r.bill.fuelBillId : r.bill.maintenanceBillId,
              type: r.type,
              vehicleNumber: r.bill.vehicleNumber,
              billNumber: r.bill.billNumber,
              billDate: r.bill.billDate,
              odometerReading: r.bill.odometerReading,
              amount: r.bill.amount,
              claimId: r.bill.claimId
            });
          });
        }
        return bills;
      })
    );
  }

  updateOdometer(type: number, id: number, odometerReading: number, billDate: string): Observable<any> {
    const payload = { odometerReading, billDate };
    const endpoint = type === 1 ? 'fuel-bills' : 'maintenance-bills';
    return this.http.put<{ success: boolean }>(`${this.billingApiUrl}/${endpoint}/${id}/odometer`, payload);
  }
}
