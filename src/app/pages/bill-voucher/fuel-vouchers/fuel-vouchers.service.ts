import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface FuelVoucher {
  id: number;
  dateOfCreation: string;
  voucherAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FuelVouchersService {
  private mockVouchers: FuelVoucher[] = [
    { id: 1, dateOfCreation: '2025-04-01', voucherAmount: 5000 },
    { id: 2, dateOfCreation: '2025-04-05', voucherAmount: 7500 },
    { id: 3, dateOfCreation: '2025-04-10', voucherAmount: 3200 },
    { id: 4, dateOfCreation: '2025-04-15', voucherAmount: 6000 },
    { id: 5, dateOfCreation: '2025-04-20', voucherAmount: 4500 },
  ];

  constructor() {}

  getVouchers(): Observable<FuelVoucher[]> {
    return of(this.mockVouchers);
  }

  getVoucherById(id: number): Observable<FuelVoucher | undefined> {
    return of(this.mockVouchers.find(v => v.id === id));
  }

  deleteVoucher(id: number): Observable<boolean> {
    this.mockVouchers = this.mockVouchers.filter(v => v.id !== id);
    return of(true);
  }
}
