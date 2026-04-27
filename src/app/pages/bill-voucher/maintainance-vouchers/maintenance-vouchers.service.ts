import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MaintenanceVoucher {
  id: number;
  dateOfCreation: string;
  voucherAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceVouchersService {
  private mockVouchers: MaintenanceVoucher[] = [
    { id: 1, dateOfCreation: '2025-04-02', voucherAmount: 3500 },
    { id: 2, dateOfCreation: '2025-04-08', voucherAmount: 5200 },
    { id: 3, dateOfCreation: '2025-04-12', voucherAmount: 2800 },
    { id: 4, dateOfCreation: '2025-04-18', voucherAmount: 4100 },
    { id: 5, dateOfCreation: '2025-04-22', voucherAmount: 6300 },
  ];

  constructor() {}

  getVouchers(): Observable<MaintenanceVoucher[]> {
    return of(this.mockVouchers);
  }

  getVoucherById(id: number): Observable<MaintenanceVoucher | undefined> {
    return of(this.mockVouchers.find(v => v.id === id));
  }

  deleteVoucher(id: number): Observable<boolean> {
    this.mockVouchers = this.mockVouchers.filter(v => v.id !== id);
    return of(true);
  }
}
