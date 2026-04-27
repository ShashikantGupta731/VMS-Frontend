import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ContractualRequisiteVoucher {
  id: number;
  dateOfCreation: string;
  voucherAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContractualRequisiteVehiclesVouchersService {
  private mockVouchers: ContractualRequisiteVoucher[] = [
    { id: 1, dateOfCreation: '2025-04-04', voucherAmount: 5500 },
    { id: 2, dateOfCreation: '2025-04-10', voucherAmount: 7200 },
    { id: 3, dateOfCreation: '2025-04-15', voucherAmount: 4800 },
    { id: 4, dateOfCreation: '2025-04-20', voucherAmount: 6100 },
    { id: 5, dateOfCreation: '2025-04-24', voucherAmount: 8200 },
  ];

  constructor() {}

  getVouchers(): Observable<ContractualRequisiteVoucher[]> {
    return of(this.mockVouchers);
  }

  getVoucherById(id: number): Observable<ContractualRequisiteVoucher | undefined> {
    return of(this.mockVouchers.find(v => v.id === id));
  }

  deleteVoucher(id: number): Observable<boolean> {
    this.mockVouchers = this.mockVouchers.filter(v => v.id !== id);
    return of(true);
  }
}
