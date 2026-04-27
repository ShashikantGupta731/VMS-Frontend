import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppCardComponent } from '../../../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '../../../../shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '../../../../shared/components/ui/app-input/input.component';

export interface HiredVehicleBill {
  billNumber: string;
  billDate: string;
  vehicleNumber: string;
  billPeriodFrom: string;
  billPeriodTo: string;
  kmCovered: number;
  amount: number;
}

@Component({
  selector: 'app-add-hired-vehicle-voucher',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AppCardComponent, AppButtonComponent, AppDataTableComponent, AppInputComponent],
  templateUrl: './add-hired-vehicle-voucher.component.html',
  styleUrl: './add-hired-vehicle-voucher.component.scss'
})
export class AddHiredVehicleVoucherComponent implements OnInit {
  voucherForm: FormGroup;
  bills: HiredVehicleBill[] = [];
  isLoading = false;
  totalBillAmount = 0;

  // Office options for select
  officeOptions = [
    { label: 'Select Office', value: '' },
    { label: 'Office A', value: 'office-a' },
    { label: 'Office B', value: 'office-b' },
    { label: 'Office C', value: 'office-c' },
  ];

  // Vehicle type options
  vehicleTypeOptions = [
    { label: 'Select Vehicle Type', value: '' },
    { label: 'Car', value: 'car' },
    { label: 'Truck', value: 'truck' },
    { label: 'Bus', value: 'bus' },
    { label: 'Van', value: 'van' },
  ];

  // Table columns
  tableColumns: TableColumn[] = [
    { key: 'id', label: '#' },
    { key: 'billNumber', label: 'Bill Number' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'billPeriodFrom', label: 'Bill Period From' },
    { key: 'billPeriodTo', label: 'Bill Period To' },
    { key: 'kmCovered', label: 'KM Covered' },
    { key: 'amount', label: 'Amount' },
    { key: 'action', label: 'Action' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.voucherForm = this.createForm();
  }

  ngOnInit(): void {}

  private createForm(): FormGroup {
    return this.fb.group({
      // Section 1: Voucher & Sanction Details
      forwardedToTreasury: ['no', Validators.required],
      subVoucherNo: ['', Validators.required],
      subVoucherDescription: ['', Validators.required],
      sanctionOrderNo: ['', Validators.required],
      sanctionOrderDate: ['', Validators.required],
      sanctionAuthority: ['', Validators.required],
      firmName: ['', Validators.required],
      tax: [0, [Validators.required, Validators.min(0)]],

      // Section 2: Add Vehicle Bills
      billNumber: ['', Validators.required],
      billDate: ['', Validators.required],
      officeName: ['', Validators.required],
      contractorName: ['', Validators.required],
      contractorPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      vehicleType: ['', Validators.required],
      noOfVehicles: [1, [Validators.required, Validators.min(1)]],
      vehicleNo: ['', Validators.required],
      hiredFrom: ['', Validators.required],
      hiredTo: ['', Validators.required],
      kmCovered: [0, [Validators.required, Validators.min(0)]],
      billAmount: [0, [Validators.required, Validators.min(0)]],
    });
  }

  get voucherSection() {
    return this.voucherForm.controls;
  }

  addBillAndSaveAsDraft(): void {
    if (this.voucherForm.invalid) {
      this.markFormGroupTouched(this.voucherForm);
      this.toastr.error('Please fill all required fields', 'Validation Error');
      return;
    }

    const formValue = this.voucherForm.value;

    const newBill: HiredVehicleBill = {
      billNumber: formValue.billNumber,
      billDate: formValue.billDate,
      vehicleNumber: formValue.vehicleNo,
      billPeriodFrom: formValue.hiredFrom,
      billPeriodTo: formValue.hiredTo,
      kmCovered: formValue.kmCovered,
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
      officeName: '',
      contractorName: '',
      contractorPhone: '',
      vehicleType: '',
      noOfVehicles: 1,
      vehicleNo: '',
      hiredFrom: '',
      hiredTo: '',
      kmCovered: 0,
      billAmount: 0,
    });
  }

  lockBills(): void {
    if (this.bills.length === 0) {
      this.toastr.error('Please add at least one bill', 'Error');
      return;
    }

    if (this.voucherForm.get('forwardedToTreasury')?.invalid ||
        this.voucherForm.get('subVoucherNo')?.invalid ||
        this.voucherForm.get('subVoucherDescription')?.invalid ||
        this.voucherForm.get('sanctionOrderNo')?.invalid ||
        this.voucherForm.get('sanctionOrderDate')?.invalid ||
        this.voucherForm.get('sanctionAuthority')?.invalid ||
        this.voucherForm.get('firmName')?.invalid) {
      this.markFormGroupTouched(this.voucherForm);
      this.toastr.error('Please fill all required voucher details', 'Validation Error');
      return;
    }

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.toastr.success('Bills locked successfully', 'Success');
      // Navigate back to hired vehicle vouchers list
      this.router.navigate(['/hired-vehicle-voucher']);
    }, 1500);
  }

  canLockBills(): boolean {
    return this.bills.length > 0;
  }

  getTableData(): any[] {
    return this.bills.map((bill, index) => ({
      id: index + 1,
      billNumber: bill.billNumber,
      billDate: bill.billDate,
      vehicleNumber: bill.vehicleNumber,
      billPeriodFrom: bill.billPeriodFrom,
      billPeriodTo: bill.billPeriodTo,
      kmCovered: bill.kmCovered,
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
        this.router.navigate(['/hired-vehicle-voucher']);
      }
    } else {
      this.router.navigate(['/hired-vehicle-voucher']);
    }
  }
}
