import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface HiredVehicleVoucher {
  id: number;
  dateOfCreation: string;
  voucherAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class HiredVehicleVouchersService {
  private mockVouchers: HiredVehicleVoucher[] = [
    { id: 1, dateOfCreation: '2025-04-03', voucherAmount: 4500 },
    { id: 2, dateOfCreation: '2025-04-09', voucherAmount: 6200 },
    { id: 3, dateOfCreation: '2025-04-14', voucherAmount: 3800 },
    { id: 4, dateOfCreation: '2025-04-19', voucherAmount: 5100 },
    { id: 5, dateOfCreation: '2025-04-23', voucherAmount: 7200 },
  ];

  constructor() {}

  getVouchers(): Observable<HiredVehicleVoucher[]> {
    return of(this.mockVouchers);
  }

  getVoucherById(id: number): Observable<HiredVehicleVoucher | undefined> {
    return of(this.mockVouchers.find(v => v.id === id));
  }

  deleteVoucher(id: number): Observable<boolean> {
    this.mockVouchers = this.mockVouchers.filter(v => v.id !== id);
    return of(true);
  }
}
