import { Injectable } from '@angular/core';
import { Bill } from '../send-bills-ifms/send-bills.service';

@Injectable({
  providedIn: 'root',
})
export class IfmsBillProcessStateService {
  private selectedBills: Bill[] = [];

  setSelectedBills(bills: Bill[]): void {
    this.selectedBills = bills.map((bill) => ({ ...bill }));
  }

  getSelectedBills(): Bill[] {
    return this.selectedBills.map((bill) => ({ ...bill }));
  }

  clear(): void {
    this.selectedBills = [];
  }
}
