import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root',
})
export class SendBillsService {
  private mockBills: Bill[] = [
    {
      claimNumber: 'CLM-2024-001',
      amount: 15000,
      subVoucherNo: 'SV-001',
      sanctionOrderNo: 'SO-2024-001',
      sanctionAuthority: 'Finance Department',
      sanctionOrderDate: '2024-01-15',
      claimFor: 'Vehicle Maintenance',
      postDate: '2024-01-20',
      selected: false,
    },
    {
      claimNumber: 'CLM-2024-002',
      amount: 25000,
      subVoucherNo: 'SV-002',
      sanctionOrderNo: 'SO-2024-002',
      sanctionAuthority: 'Finance Department',
      sanctionOrderDate: '2024-01-18',
      claimFor: 'Fuel Expenses',
      postDate: '2024-01-22',
      selected: false,
    },
    {
      claimNumber: 'CLM-2024-003',
      amount: 0,
      subVoucherNo: 'SV-003',
      sanctionOrderNo: 'SO-2024-003',
      sanctionAuthority: 'Finance Department',
      sanctionOrderDate: '2024-01-20',
      claimFor: 'Insurance',
      postDate: '2024-01-25',
      selected: false,
    },
    {
      claimNumber: 'CLM-2024-004',
      amount: 35000,
      subVoucherNo: 'SV-004',
      sanctionOrderNo: 'SO-2024-004',
      sanctionAuthority: 'Transport Department',
      sanctionOrderDate: '2024-01-22',
      claimFor: 'Vehicle Purchase',
      postDate: '2024-01-28',
      selected: false,
    },
    {
      claimNumber: 'CLM-2024-005',
      amount: 12000,
      subVoucherNo: 'SV-005',
      sanctionOrderNo: 'SO-2024-005',
      sanctionAuthority: 'Finance Department',
      sanctionOrderDate: '2024-01-25',
      claimFor: 'Repair & Maintenance',
      postDate: '2024-01-30',
      selected: false,
    },
    {
      claimNumber: 'CLM-2024-006',
      amount: 45000,
      subVoucherNo: 'SV-006',
      sanctionOrderNo: 'SO-2024-006',
      sanctionAuthority: 'Health Department',
      sanctionOrderDate: '2024-01-28',
      claimFor: 'Ambulance Services',
      postDate: '2024-02-02',
      selected: false,
    },
    {
      claimNumber: 'CLM-2024-007',
      amount: 28000,
      subVoucherNo: 'SV-007',
      sanctionOrderNo: 'SO-2024-007',
      sanctionAuthority: 'Finance Department',
      sanctionOrderDate: '2024-02-01',
      claimFor: 'Driver Salary',
      postDate: '2024-02-05',
      selected: false,
    },
    {
      claimNumber: 'CLM-2024-008',
      amount: 0,
      subVoucherNo: 'SV-008',
      sanctionOrderNo: 'SO-2024-008',
      sanctionAuthority: 'Finance Department',
      sanctionOrderDate: '2024-02-03',
      claimFor: 'Miscellaneous',
      postDate: '2024-02-08',
      selected: false,
    },
  ];

  constructor() {}

  getBills(): Observable<Bill[]> {
    return of(this.mockBills);
  }

  processBills(bills: Bill[]): Observable<{ message: string; processedCount: number }> {
    return of({
      message: 'Bills successfully processed and sent to IFMS',
      processedCount: bills.length,
    });
  }
}
