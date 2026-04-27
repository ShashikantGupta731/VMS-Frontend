import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppCardComponent } from '../../../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '../../../../shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '../../../../shared/components/ui/app-input/input.component';

export interface MaintenanceBill {
  receiptNo: string;
  maintenanceDate: string;
  vehicleNumber: string;
  odometerReading: number;
  maintenanceType: string;
  maintenanceAmount: number;
  permissionNOC?: string;
  sanctionAuthorityMobile?: string;
}

@Component({
  selector: 'app-add-maintenance-voucher',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AppCardComponent, AppButtonComponent, AppDataTableComponent, AppInputComponent],
  templateUrl: './add-maintenance-voucher.component.html',
  styleUrl: './add-maintenance-voucher.component.scss'
})
export class AddMaintenanceVoucherComponent implements OnInit {
  voucherForm: FormGroup;
  bills: MaintenanceBill[] = [];
  isLoading = false;
  totalBillAmount = 0;

  // Table columns
  tableColumns: TableColumn[] = [
    { key: 'id', label: '#' },
    { key: 'maintenanceDate', label: 'Maintenance Date' },
    { key: 'receiptNumber', label: 'Receipt Number' },
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'odometerReading', label: 'Odometer Reading' },
    { key: 'maintenanceType', label: 'Maintenance Type' },
    { key: 'maintenanceAmount', label: 'Maintenance Amount' },
    { key: 'permissionNOC', label: 'Permission NOC' },
    { key: 'sanctionAuthorityMobile', label: 'Sanction Authority Mobile' },
    { key: 'action', label: 'Action' },
  ];

  // Maintenance type options
  maintenanceTypeOptions = [
    { label: 'General Service', value: 'general_service' },
    { label: 'Oil Change', value: 'oil_change' },
    { label: 'Tyre Replacement', value: 'tyre_replacement' },
    { label: 'Battery Replacement', value: 'battery_replacement' },
    { label: 'Engine Repair', value: 'engine_repair' },
    { label: 'AC Repair', value: 'ac_repair' },
    { label: 'Body Work', value: 'body_work' },
    { label: 'Other', value: 'other' },
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
      receiptNo: ['', Validators.required],
      maintenanceDate: ['', Validators.required],
      vehicleNo: ['', Validators.required],
      previousReading: [0, [Validators.required, Validators.min(0)]],
      previousAmount: [0, [Validators.required, Validators.min(0)]],
      odometerReading: [0, [Validators.required, Validators.min(0)]],
      maintenanceType: ['', Validators.required],
      maintenanceAmount: [0, [Validators.required, Validators.min(0)]],
      repairDetails: [''],
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

    const newBill: MaintenanceBill = {
      receiptNo: formValue.receiptNo,
      maintenanceDate: formValue.maintenanceDate,
      vehicleNumber: formValue.vehicleNo,
      odometerReading: formValue.odometerReading,
      maintenanceType: formValue.maintenanceType,
      maintenanceAmount: formValue.maintenanceAmount,
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
    this.totalBillAmount = this.bills.reduce((sum, bill) => sum + bill.maintenanceAmount, 0);
  }

  resetBillFields(): void {
    this.voucherForm.patchValue({
      receiptNo: '',
      maintenanceDate: '',
      vehicleNo: '',
      previousReading: 0,
      previousAmount: 0,
      odometerReading: 0,
      maintenanceType: '',
      maintenanceAmount: 0,
      repairDetails: '',
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
      // Navigate back to maintenance vouchers list
      this.router.navigate(['/maintenance-voucher']);
    }, 1500);
  }

  canLockBills(): boolean {
    return this.bills.length > 0;
  }

  getTableData(): any[] {
    return this.bills.map((bill, index) => ({
      id: index + 1,
      maintenanceDate: bill.maintenanceDate,
      receiptNumber: bill.receiptNo,
      vehicleNumber: bill.vehicleNumber,
      odometerReading: bill.odometerReading,
      maintenanceType: bill.maintenanceType,
      maintenanceAmount: bill.maintenanceAmount,
      permissionNOC: bill.permissionNOC || '-',
      sanctionAuthorityMobile: bill.sanctionAuthorityMobile || '-',
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
        this.router.navigate(['/maintenance-voucher']);
      }
    } else {
      this.router.navigate(['/maintenance-voucher']);
    }
  }
}
