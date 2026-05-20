import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

// Our new VMS claim model (from billing backend)
export interface IfmsClaim {
  billClaimId: number;
  claimNumber: string;
  type: number;              // 1=Fuel, 2=Maint, 3=Hired, 4=Contractual, 5=Misc
  totalAmount: number;
  status: number;            // 2 = Verified
  createdAt: string;
  createdBy: string;
  // Extended for display
  fuelMaintenanceLabel?: string;
  // Legacy fields (kept for upload/sync flow)
  claimNo?: string;
  ifmsBillNo?: number | null;
  subVoucherNo?: string;
  sanctionOrderNo?: string;
  actionDate?: string;
  amount?: number;
  fuelMaintenance?: number;
}

export interface FilterSummary {
  claimType: string;
  fromDate: string;
  toDate: string;
  totalAmount: number;
  totalRows: number;
}

@Injectable({
  providedIn: 'root'
})
export class IfmsClaimsService {
  private http = inject(HttpClient);
  private billingApiUrl = `${environment.apiUrl}/billing`;
  private legacyApiUrl = `${environment.apiUrl}/BillIntegration`;

  /**
   * NEW: Fetches Verified claims (status=2) from our own VMS backend.
   * This replaces the legacy IFMS endpoint for the main table view.
   */
  getVerifiedClaims(): Observable<{ success: boolean; result: IfmsClaim[] }> {
    return this.http.get<{ success: boolean; result: any[] }>(
      `${this.billingApiUrl}/claims?status=2&forwardedToTreasury=true`
    ).pipe(
      map(res => ({
        success: res.success,
        result: (res.result || []).map((c: any) => ({
          ...c,
          // Map our new model fields to match legacy field names used in table/sort/filter
          claimNo: c.claimNumber,
          amount: c.totalAmount,
          actionDate: c.createdAt,
          fuelMaintenance: c.type
        }))
      }))
    );
  }

  /** LEGACY: Upload merged PDF vouchers to Punjab Treasury sFTP */
  uploadMergedPdf(formData: FormData): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.legacyApiUrl}/UploadMergedPdf`, formData);
  }

  /** LEGACY: Sync claim status back from Punjab IFMS portal */
  updateStatusFromIFMS(): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(
      `${this.legacyApiUrl}/UpdateIfmsBillStatus`,
      { ClaimType: 'Individual' }
    );
  }
}

