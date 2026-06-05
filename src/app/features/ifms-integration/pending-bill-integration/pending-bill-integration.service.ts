import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

export interface PendingIntegrationClaim {
  billClaimId: number;
  claimNumber: string;
  totalAmount: number;
  status: number; // 2 = Verified (Pending Integration), 4 = Discarded
  type: number;
  claimFor: string;
  createdBy: string;
  createdAt: string;
  comments: string;
  forwardedToTreasury: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PendingBillIntegrationService {
  private http = inject(HttpClient);
  private billingApiUrl = `${environment.apiUrl}/billing`;

  private claimTypesMap: Record<number, string> = {
    1: 'Fuel',
    2: 'Maintenance',
    3: 'Hired',
    4: 'Miscellaneous Store',
    5: 'Contractual/Requisite'
  };

  getPendingIntegrationClaims(): Observable<PendingIntegrationClaim[]> {
    return this.http.get<{ success: boolean; result: any[] }>(
      `${this.billingApiUrl}/claims/pending-integration`
    ).pipe(
      map(res => {
        if (res && res.success && Array.isArray(res.result)) {
          return res.result.map(item => this.mapClaim(item));
        }
        return [];
      })
    );
  }

  discardClaim(claimId: number, comments?: string): Observable<any> {
    return this.http.post<{ success: boolean }>(`${this.billingApiUrl}/claims/${claimId}/discard`, { comments });
  }

  restoreClaim(claimId: number, comments?: string): Observable<any> {
    return this.http.post<{ success: boolean }>(`${this.billingApiUrl}/claims/${claimId}/restore`, { comments });
  }

  private mapClaim(item: any): PendingIntegrationClaim {
    return {
      billClaimId: item.billClaimId,
      claimNumber: item.claimNumber || '',
      totalAmount: item.totalAmount || 0,
      status: item.status,
      type: item.type,
      claimFor: this.claimTypesMap[item.type] || 'Other',
      createdBy: item.createdBy || '',
      createdAt: item.createdAt || '',
      comments: item.comments || '',
      forwardedToTreasury: item.forwardedToTreasury || false
    };
  }
}
