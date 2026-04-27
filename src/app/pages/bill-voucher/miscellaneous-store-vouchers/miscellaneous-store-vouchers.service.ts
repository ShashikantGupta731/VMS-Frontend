import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MiscellaneousStoreVoucher {
  id: number;
  dateOfCreation: string;
  voucherAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class MiscellaneousStoreVouchersService {
  private mockVouchers: MiscellaneousStoreVoucher[] = [
    { id: 1, dateOfCreation: '2025-04-05', voucherAmount: 2500 },
    { id: 2, dateOfCreation: '2025-04-11', voucherAmount: 4200 },
    { id: 3, dateOfCreation: '2025-04-16', voucherAmount: 1800 },
    { id: 4, dateOfCreation: '2025-04-21', voucherAmount: 3100 },
    { id: 5, dateOfCreation: '2025-04-25', voucherAmount: 5200 },
  ];

  constructor() {}

  getVouchers(): Observable<MiscellaneousStoreVoucher[]> {
    return of(this.mockVouchers);
  }

  getVoucherById(id: number): Observable<MiscellaneousStoreVoucher | undefined> {
    return of(this.mockVouchers.find(v => v.id === id));
  }

  deleteVoucher(id: number): Observable<boolean> {
    this.mockVouchers = this.mockVouchers.filter(v => v.id !== id);
    return of(true);
  }
}
