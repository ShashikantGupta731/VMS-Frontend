import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '@env/environment';

export interface NonTreasuryClaim {
  claimNo: string;
  claimFor: string;
  date: string;
  amount: number;
  status: string;
  fuelMaintenance: number;
  httpStatus: number;
  billClaimId?: number;
}

export interface FilterSummary {
  claimType: string;
  totalAmount: number;
  totalRows: number;
  fromDate: string;
  toDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class NonTreasuryClaimsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/BillIntegration`;
  private billingApiUrl = `${environment.apiUrl}/billing`;

  private cache: NonTreasuryClaim[] = [];
  private cachedFrom: string = '';
  private cachedTo: string = '';

  private claimTypesMap: Record<number, string> = {
    1: 'Fuel',
    2: 'Maintenance',
    3: 'Hired',
    4: 'Miscellaneous Store',
    5: 'Contractual/Requisite'
  };

  private statusMap: Record<number, string> = {
    200: 'Bill Created',
    301: 'Bill Discarded from VMS'
  };

  getClaims(filters?: { fromDate: string; toDate: string }): Observable<NonTreasuryClaim[]> {
    const fromDate = filters?.fromDate || '';
    const toDate = filters?.toDate || '';

    // If cache is valid, return cached claims
    if (this.cache.length > 0 && this.cachedFrom === fromDate && this.cachedTo === toDate) {
      return of(this.cache);
    }

    return this.http.get<{ success: boolean; result: any[] }>(
      `${this.billingApiUrl}/claims?status=2&forwardedToTreasury=false`
    ).pipe(
      map(res => {
        if (res && res.success && Array.isArray(res.result)) {
          this.cache = res.result.map(item => this.mapClaim(item));
          this.cachedFrom = fromDate;
          this.cachedTo = toDate;
          return this.cache;
        }
        return [];
      })
    );
  }

  getFilteredClaims(filters: any): Observable<{ claims: NonTreasuryClaim[]; summary: FilterSummary }> {
    return this.getClaims({ fromDate: filters.fromDate, toDate: filters.toDate }).pipe(
      map(claims => {
        let filtered = [...claims];

        // Filter by claim type
        if (filters.claimType && filters.claimType !== '0') {
          const typeVal = parseInt(filters.claimType);
          filtered = filtered.filter(claim => claim.fuelMaintenance === typeVal);
        }

        // Filter by search text
        if (filters.searchText) {
          const searchLower = filters.searchText.toLowerCase();
          filtered = filtered.filter(claim =>
            claim.claimNo.toLowerCase().includes(searchLower) ||
            claim.claimFor.toLowerCase().includes(searchLower)
          );
        }

        // Filter locally by Date Range (fromDate and toDate)
        if (filters.fromDate) {
          const fromDateLimit = new Date(filters.fromDate);
          fromDateLimit.setHours(0, 0, 0, 0);
          filtered = filtered.filter(claim => claim.date ? new Date(claim.date) >= fromDateLimit : true);
        }
        if (filters.toDate) {
          const toDateLimit = new Date(filters.toDate);
          toDateLimit.setHours(23, 59, 59, 999);
          filtered = filtered.filter(claim => claim.date ? new Date(claim.date) <= toDateLimit : true);
        }

        const summary: FilterSummary = {
          claimType: this.claimTypesMap[parseInt(filters.claimType)] || 'All',
          totalAmount: filtered.reduce((sum, claim) => sum + claim.amount, 0),
          totalRows: filtered.length,
          fromDate: filters.fromDate || 'N/A',
          toDate: filters.toDate || 'N/A'
        };

        return { claims: filtered, summary };
      })
    );
  }

  searchClaims(searchText: string, filters: any): Observable<NonTreasuryClaim[]> {
    return this.getFilteredClaims({ ...filters, searchText }).pipe(
      map(data => data.claims)
    );
  }

  private mapClaim(item: any): NonTreasuryClaim {
    return {
      billClaimId: item.billClaimId,
      claimNo: item.claimNumber || '',
      claimFor: this.claimTypesMap[item.type] || 'Other',
      date: item.createdAt || '',
      amount: item.totalAmount || 0,
      status: 'Verified',
      fuelMaintenance: item.type,
      httpStatus: 200
    };
  }
}
