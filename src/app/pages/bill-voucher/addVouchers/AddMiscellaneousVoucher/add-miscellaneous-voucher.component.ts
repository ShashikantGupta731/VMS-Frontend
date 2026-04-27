import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppCardComponent } from '../../../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '../../../../shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '../../../../shared/components/ui/app-input/input.component';

export interface MiscellaneousBill {
  billNumber: string;
  billDate: string;
  inventoryItem: string;
  quantity: number;
  amount: number;
}

@Component({
  selector: 'app-add-miscellaneous-voucher',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AppCardComponent, AppButtonComponent, AppDataTableComponent, AppInputComponent],
  templateUrl: './add-miscellaneous-voucher.component.html',
  styleUrl: './add-miscellaneous-voucher.component.scss'
})
export class AddMiscellaneousVoucherComponent implements OnInit {
  voucherForm: FormGroup;
  bills: MiscellaneousBill[] = [];
  isLoading = false;
  totalBillAmount = 0;

  stockItemOptions = [
    { label: 'Tyres', value: 'tyres' },
    { label: 'Batteries', value: 'batteries' },
    { label: 'Oil', value: 'oil' },
    { label: 'Spare Parts', value: 'spare_parts' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Other', value: 'other' },
  ];

  tableColumns: TableColumn[] = [
    { key: 'id', label: '#' },
    { key: 'billNumber', label: 'Bill Number' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'inventoryItem', label: 'Inventory Item' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'amount', label: 'Amount' },
    { key: 'action', label: 'Action' },
  ];

  constructor(private fb: FormBuilder, private router: Router, private toastr: ToastrService) {
    this.voucherForm = this.createForm();
  }

  ngOnInit(): void {}

  private createForm(): FormGroup {
    return this.fb.group({
      forwardedToTreasury: ['no', Validators.required],
      subVoucherNo: ['', Validators.required],
      subVoucherDescription: ['', Validators.required],
      sanctionOrderNo: ['', Validators.required],
      sanctionOrderDate: ['', Validators.required],
      sanctionAuthority: ['', Validators.required],
      firmName: ['', Validators.required],
      tax: [0, [Validators.required, Validators.min(0)]],
      billNumber: ['', Validators.required],
      billDate: ['', Validators.required],
      stockItem: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      billAmount: [0, [Validators.required, Validators.min(0)]],
    });
  }

  get voucherSection() { return this.voucherForm.controls; }

  addBillAndSaveAsDraft(): void {
    if (this.voucherForm.invalid) {
      this.markFormGroupTouched(this.voucherForm);
      this.toastr.error('Please fill all required fields', 'Validation Error');
      return;
    }

    const formValue = this.voucherForm.value;
    const newBill: MiscellaneousBill = {
      billNumber: formValue.billNumber,
      billDate: formValue.billDate,
      inventoryItem: formValue.stockItem,
      quantity: formValue.quantity,
      amount: formValue.billAmount,
    };

    this.bills.push(newBill);
    this.calculateTotalAmount();
    this.resetBillFields();
    this.toastr.success('Bill added successfully', 'Success');
  }

  deleteBill(index: number): void {
    this.bills.splice(index, 1);
    this.calculateTotalAmount();
    this.toastr.success('Bill deleted successfully', 'Success');
  }

  calculateTotalAmount(): void {
    this.totalBillAmount = this.bills.reduce((sum, bill) => sum + bill.amount, 0);
  }

  resetBillFields(): void {
    this.voucherForm.patchValue({
      billNumber: '',
      billDate: '',
      stockItem: '',
      quantity: 0,
      billAmount: 0,
    });
  }

  lockBills(): void {
    if (this.bills.length === 0) {
      this.toastr.error('Please add at least one bill', 'Error');
      return;
    }

    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.toastr.success('Bills locked successfully', 'Success');
      this.router.navigate(['/miscellaneous-store-voucher']);
    }, 1500);
  }

  canLockBills(): boolean { return this.bills.length > 0; }

  getTableData(): any[] {
    return this.bills.map((bill, index) => ({
      id: index + 1,
      billNumber: bill.billNumber,
      billDate: bill.billDate,
      inventoryItem: bill.inventoryItem,
      quantity: bill.quantity,
      amount: bill.amount,
      action: 'Delete',
    }));
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancel(): void {
    if (this.bills.length > 0) {
      if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        this.router.navigate(['/miscellaneous-store-voucher']);
      }
    } else {
      this.router.navigate(['/miscellaneous-store-voucher']);
    }
  }
}
