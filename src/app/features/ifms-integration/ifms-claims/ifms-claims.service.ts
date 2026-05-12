import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface IfmsClaim {
  claimNo: string;
  ifmsBillNo: string;
  claimFor: string;
  date: string;
  amount: number;
  subVoucherNo: string;
  sanctionOrderNo: string;
  ifmsStatus: string;
}

export interface FilterSummary {
  claimType: string;
  fromDate: string;
  toDate: string;
  totalAmount: number;
  totalRows: number;
}

export interface FilteredClaimsResponse {
  claims: IfmsClaim[];
  summary: FilterSummary;
}

@Injectable({
  providedIn: 'root'
})
export class IfmsClaimsService {
  private mockClaims: IfmsClaim[] = [
    {
      claimNo: 'CLM001',
      ifmsBillNo: 'IFMS-2024-001',
      claimFor: 'Fuel',
      date: '2024-01-15',
      amount: 15000,
      subVoucherNo: 'SV-001',
      sanctionOrderNo: 'SO-2024-001',
      ifmsStatus: 'Approved'
    },
    {
      claimNo: 'CLM002',
      ifmsBillNo: 'IFMS-2024-002',
      claimFor: 'Maintenance',
      date: '2024-02-20',
      amount: 25000,
      subVoucherNo: 'SV-002',
      sanctionOrderNo: 'SO-2024-002',
      ifmsStatus: 'Pending'
    },
    {
      claimNo: 'CLM003',
      ifmsBillNo: 'IFMS-2024-003',
      claimFor: 'Tyre Replacement',
      date: '2024-03-10',
      amount: 18000,
      subVoucherNo: 'SV-003',
      sanctionOrderNo: 'SO-2024-003',
      ifmsStatus: 'Approved'
    },
    {
      claimNo: 'CLM004',
      ifmsBillNo: 'IFMS-2024-004',
      claimFor: 'Insurance',
      date: '2024-04-05',
      amount: 35000,
      subVoucherNo: 'SV-004',
      sanctionOrderNo: 'SO-2024-004',
      ifmsStatus: 'Rejected'
    },
    {
      claimNo: 'CLM005',
      ifmsBillNo: 'IFMS-2024-005',
      claimFor: 'Fuel',
      date: '2024-05-12',
      amount: 12000,
      subVoucherNo: 'SV-005',
      sanctionOrderNo: 'SO-2024-005',
      ifmsStatus: 'Pending'
    },
    {
      claimNo: 'CLM006',
      ifmsBillNo: 'IFMS-2024-006',
      claimFor: 'Maintenance',
      date: '2024-06-18',
      amount: 28000,
      subVoucherNo: 'SV-006',
      sanctionOrderNo: 'SO-2024-006',
      ifmsStatus: 'Approved'
    },
    {
      claimNo: 'CLM007',
      ifmsBillNo: 'IFMS-2024-007',
      claimFor: 'Fuel',
      date: '2024-07-22',
      amount: 16500,
      subVoucherNo: 'SV-007',
      sanctionOrderNo: 'SO-2024-007',
      ifmsStatus: 'Pending'
    },
    {
      claimNo: 'CLM008',
      ifmsBillNo: 'IFMS-2024-008',
      claimFor: 'Other',
      date: '2024-08-30',
      amount: 8000,
      subVoucherNo: 'SV-008',
      sanctionOrderNo: 'SO-2024-008',
      ifmsStatus: 'Approved'
    }
  ];

  constructor() {}

  getClaims(): Observable<IfmsClaim[]> {
    // TODO: Replace with actual API call
    return of(this.mockClaims).pipe(delay(500));
  }

  getFilteredClaims(filters: any): Observable<FilteredClaimsResponse> {
    let filtered = [...this.mockClaims];

    // Apply filters
    if (filters.claimType) {
      filtered = filtered.filter(claim => claim.claimFor === filters.claimType);
    }

    if (filters.fromDate) {
      filtered = filtered.filter(claim => new Date(claim.date) >= new Date(filters.fromDate));
    }

    if (filters.toDate) {
      filtered = filtered.filter(claim => new Date(claim.date) <= new Date(filters.toDate));
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(claim =>
        claim.claimNo.toLowerCase().includes(searchLower) ||
        claim.ifmsBillNo.toLowerCase().includes(searchLower) ||
        claim.claimFor.toLowerCase().includes(searchLower) ||
        claim.subVoucherNo.toLowerCase().includes(searchLower) ||
        claim.sanctionOrderNo.toLowerCase().includes(searchLower)
      );
    }

    // Calculate summary
    const summary: FilterSummary = {
      claimType: filters.claimType || 'All',
      fromDate: filters.fromDate || 'N/A',
      toDate: filters.toDate || 'N/A',
      totalAmount: filtered.reduce((sum, claim) => sum + claim.amount, 0),
      totalRows: filtered.length
    };

    // TODO: Replace with actual API call
    return of({ claims: filtered, summary }).pipe(delay(300));
  }

  searchClaims(searchText: string, filters: any): Observable<IfmsClaim[]> {
    let filtered = [...this.mockClaims];

    if (filters.claimType) {
      filtered = filtered.filter(claim => claim.claimFor === filters.claimType);
    }

    if (filters.fromDate) {
      filtered = filtered.filter(claim => new Date(claim.date) >= new Date(filters.fromDate));
    }

    if (filters.toDate) {
      filtered = filtered.filter(claim => new Date(claim.date) <= new Date(filters.toDate));
    }

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(claim =>
        claim.claimNo.toLowerCase().includes(searchLower) ||
        claim.ifmsBillNo.toLowerCase().includes(searchLower) ||
        claim.claimFor.toLowerCase().includes(searchLower) ||
        claim.subVoucherNo.toLowerCase().includes(searchLower) ||
        claim.sanctionOrderNo.toLowerCase().includes(searchLower)
      );
    }

    // TODO: Replace with actual API call
    return of(filtered).pipe(delay(200));
  }

  updateStatusFromIFMS(): Observable<{ message: string }> {
    // TODO: Replace with actual API call
    return of({ message: 'Status updated successfully from IFMS' }).pipe(delay(1000));
  }
}
