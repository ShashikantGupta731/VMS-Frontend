import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SendBillsService, Bill } from './send-bills.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';

@Component({
  selector: 'app-send-bills-to-ifms',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AppCardComponent, AppButtonComponent, AppDataTableComponent],
  providers: [SendBillsService],
  templateUrl: './send-bills-to-ifms.component.html',
  styleUrl: './send-bills-to-ifms.component.scss',
})
export class SendBillsToIfmsComponent implements OnInit {
  bills: Bill[] = [];
  selectedBills: Bill[] = [];
  isLoading = false;
  selectAll = false;

  // Table columns
  tableColumns: TableColumn[] = [
    { key: 'claimNumber', label: 'Claim Number' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'subVoucherNo', label: 'Sub Voucher No' },
    { key: 'sanctionOrderNo', label: 'Sanction Order No' },
    { key: 'sanctionAuthority', label: 'Sanction Authority' },
    { key: 'sanctionOrderDate', label: 'Sanction Order Date' },
    { key: 'claimFor', label: 'Claim For' },
    { key: 'postDate', label: 'Post Date' },
  ];

  // Table actions
  tableActions: TableAction[] = [
    {
      label: 'Select',
      action: (row: Bill) => this.toggleBillSelection(row),
      disabled: (row: Bill) => this.isBillDisabled(row),
    },
  ];

  constructor(private sendBillsService: SendBillsService) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.isLoading = true;
    this.sendBillsService.getBills().subscribe({
      next: (data: Bill[]) => {
        this.bills = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading bills:', error);
        this.isLoading = false;
      },
    });
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.bills.forEach((bill) => {
      if (bill.amount > 0) {
        bill.selected = this.selectAll;
      }
    });
    this.updateSelectedBills();
  }

  toggleSelectAllFromTable(selectAll: boolean): void {
    this.selectAll = selectAll;
    this.bills.forEach((bill) => {
      if (bill.amount > 0) {
        bill.selected = selectAll;
      }
    });
    this.updateSelectedBills();
  }

  onRowSelect(event: { row: Bill; selected: boolean }): void {
    event.row.selected = event.selected;
    this.updateSelectedBills();
    this.updateSelectAllState();
  }

  isRowSelected(row: Bill): boolean {
    return row.selected || false;
  }

  isRowDisabled(row: Bill): boolean {
    return this.isBillDisabled(row);
  }

  toggleBillSelection(bill: Bill): void {
    if (bill.amount > 0) {
      bill.selected = !bill.selected;
      this.updateSelectedBills();
      this.updateSelectAllState();
    }
  }

  updateSelectedBills(): void {
    this.selectedBills = this.bills.filter((bill) => bill.selected);
  }

  updateSelectAllState(): void {
    const eligibleBills = this.bills.filter((bill) => bill.amount > 0);
    const selectedEligibleBills = eligibleBills.filter((bill) => bill.selected);
    this.selectAll = selectedEligibleBills.length === eligibleBills.length && eligibleBills.length > 0;
  }

  get totalAmount(): number {
    return this.selectedBills.reduce((sum, bill) => sum + bill.amount, 0);
  }

  get totalTax(): number {
    return this.selectedBills.reduce((sum, bill) => sum + (bill.amount * 0.18), 0);
  }

  processSelectedBills(): void {
    if (this.selectedBills.length === 0) {
      return;
    }

    this.isLoading = true;
    this.sendBillsService.processBills(this.selectedBills).subscribe({
      next: (response: { message: string; processedCount: number }) => {
        console.log('Bills processed successfully:', response);
        this.isLoading = false;
        alert(`Successfully processed ${this.selectedBills.length} bills!`);
        this.selectedBills = [];
        this.bills.forEach((bill) => (bill.selected = false));
        this.selectAll = false;
      },
      error: (error: any) => {
        console.error('Error processing bills:', error);
        this.isLoading = false;
        alert('Error processing bills. Please try again.');
      },
    });
  }

  isBillDisabled(bill: Bill): boolean {
    return bill.amount === 0;
  }

  getSelectAllState(): boolean {
    return this.selectAll;
  }
}
