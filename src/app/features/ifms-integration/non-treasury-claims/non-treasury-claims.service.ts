import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface NonTreasuryClaim {
  claimNo: string;
  claimFor: string;
  date: string;
  amount: number;
  status: string;
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
  private mockClaims: NonTreasuryClaim[] = [
    {
      claimNo: 'NTC-001',
      claimFor: 'Fuel',
      date: '2024-03-15',
      amount: 25000,
      status: 'Pending'
    },
    {
      claimNo: 'NTC-002',
      claimFor: 'Maintenance',
      date: '2024-03-18',
      amount: 15000,
      status: 'Approved'
    },
    {
      claimNo: 'NTC-003',
      claimFor: 'Tyre Replacement',
      date: '2024-03-20',
      amount: 32000,
      status: 'Rejected'
    },
    {
      claimNo: 'NTC-004',
      claimFor: 'Insurance',
      date: '2024-03-22',
      amount: 45000,
      status: 'Pending'
    },
    {
      claimNo: 'NTC-005',
      claimFor: 'Fuel',
      date: '2024-03-25',
      amount: 18000,
      status: 'Approved'
    },
    {
      claimNo: 'NTC-006',
      claimFor: 'Maintenance',
      date: '2024-03-28',
      amount: 22000,
      status: 'Pending'
    },
    {
      claimNo: 'NTC-007',
      claimFor: 'Other',
      date: '2024-04-02',
      amount: 12000,
      status: 'Approved'
    },
    {
      claimNo: 'NTC-008',
      claimFor: 'Fuel',
      date: '2024-04-05',
      amount: 28000,
      status: 'Pending'
    },
    {
      claimNo: 'NTC-009',
      claimFor: 'Tyre Replacement',
      date: '2024-04-08',
      amount: 35000,
      status: 'Approved'
    },
    {
      claimNo: 'NTC-010',
      claimFor: 'Insurance',
      date: '2024-04-10',
      amount: 50000,
      status: 'Rejected'
    },
    {
      claimNo: 'NTC-011',
      claimFor: 'Fuel',
      date: '2024-04-12',
      amount: 20000,
      status: 'Pending'
    },
    {
      claimNo: 'NTC-012',
      claimFor: 'Maintenance',
      date: '2024-04-15',
      amount: 17000,
      status: 'Approved'
    }
  ];

  constructor() {}

  getClaims(): Observable<NonTreasuryClaim[]> {
    return of(this.mockClaims).pipe(delay(300));
  }

  getFilteredClaims(filters: any): Observable<{ claims: NonTreasuryClaim[]; summary: FilterSummary }> {
    let filtered = [...this.mockClaims];

    if (filters.financialYear) {
      const [startYear, endYear] = filters.financialYear.split('-').map(Number);
      const startDate = new Date(`${startYear}-04-01`);
      const endDate = new Date(`${endYear}-03-31`);
      filtered = filtered.filter(claim => {
        const claimDate = new Date(claim.date);
        return claimDate >= startDate && claimDate <= endDate;
      });
    }

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
        claim.claimFor.toLowerCase().includes(searchLower)
      );
    }

    const summary: FilterSummary = {
      claimType: filters.claimType || 'All',
      totalAmount: filtered.reduce((sum, claim) => sum + claim.amount, 0),
      totalRows: filtered.length,
      fromDate: filters.fromDate || 'N/A',
      toDate: filters.toDate || 'N/A'
    };

    return of({ claims: filtered, summary }).pipe(delay(300));
  }

  searchClaims(searchText: string, filters: any): Observable<NonTreasuryClaim[]> {
    let filtered = [...this.mockClaims];

    if (filters.financialYear) {
      const [startYear, endYear] = filters.financialYear.split('-').map(Number);
      const startDate = new Date(`${startYear}-04-01`);
      const endDate = new Date(`${endYear}-03-31`);
      filtered = filtered.filter(claim => {
        const claimDate = new Date(claim.date);
        return claimDate >= startDate && claimDate <= endDate;
      });
    }

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
        claim.claimFor.toLowerCase().includes(searchLower)
      );
    }

    return of(filtered).pipe(delay(200));
  }
}
