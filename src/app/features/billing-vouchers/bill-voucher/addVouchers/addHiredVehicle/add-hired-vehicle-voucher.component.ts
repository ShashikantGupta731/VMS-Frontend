import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BillingService, BillType, HiredVehicleBill } from '@shared/services/billing.service';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-hired-vehicle-voucher',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AppButtonComponent, AppDataTableComponent, AppInputComponent],
  templateUrl: './add-hired-vehicle-voucher.component.html',
  styleUrl: './add-hired-vehicle-voucher.component.scss'
})
export class AddHiredVehicleVoucherComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private billingService = inject(BillingService);

  voucherForm: FormGroup;
  isLoading = signal(false);

  // Table for currently drafted bills
  draftedBillsResource = rxResource<HiredVehicleBill[], any>({
    stream: () => this.billingService.getDrafts(BillType.Hired)
  });

  // Vehicle type options
  vehicleTypeOptions = [
    { label: 'Car', value: 'Car' },
    { label: 'Truck', value: 'Truck' },
    { label: 'Bus', value: 'Bus' },
    { label: 'Van', value: 'Van' },
  ];

  // Table columns
  tableColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill No.' },
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'billDate', label: 'Date' },
    { key: 'contractorName', label: 'Contractor' },
    { key: 'hiredFrom', label: 'From' },
    { key: 'hiredTo', label: 'To' },
    { key: 'amount', label: 'Amount (₹)' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'Delete',
      action: (row: HiredVehicleBill) => this.deleteDraft(row),
      variant: 'danger'
    }
  ];

  constructor() {
    this.voucherForm = this.fb.group({
      // Header Details
      forwardedToTreasury: ['no', Validators.required],
      subVoucherNo: ['', Validators.required],
      subVoucherDescription: ['', Validators.required],
      sanctionOrderNo: ['', Validators.required],
      sanctionOrderDate: ['', Validators.required],
      sanctionAuthority: ['', Validators.required],
      firmName: ['', Validators.required],
      tax: [0, [Validators.required, Validators.min(0)]],

      // Bill Details
      billNumber: ['', Validators.required],
      billDate: [new Date().toISOString().split('T')[0], Validators.required],
      officeName: ['', Validators.required],
      contractorName: ['', Validators.required],
      contractorPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      vehicleType: ['', Validators.required],
      noOfVehicles: [1, [Validators.required, Validators.min(1)]],
      vehicleNumber: ['', Validators.required],
      hiredFrom: ['', Validators.required],
      hiredTo: ['', Validators.required],
      kmCovered: [0, [Validators.required, Validators.min(0)]],
      amount: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {}

  async addBillAndSaveAsDraft(): Promise<void> {
    if (this.voucherForm.invalid) {
      this.toastr.error('Please fill all required bill details', 'Error');
      return;
    }

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.billingService.saveBill(BillType.Hired, this.voucherForm.value));
      this.toastr.success('Hired vehicle bill saved as draft', 'Success');
      this.draftedBillsResource.reload();
      this.resetBillFields();
    } catch (error: any) {
      this.toastr.error(error.error?.msg || 'Failed to save bill', 'Error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteDraft(voucher: HiredVehicleBill): Promise<void> {
    if (confirm('Are you sure you want to delete this drafted bill?')) {
      await firstValueFrom(this.billingService.deleteBill(BillType.Hired, voucher.id));
      this.draftedBillsResource.reload();
      this.toastr.success('Draft deleted', 'Success');
    }
  }

  async lockBills(): Promise<void> {
    const bills = this.draftedBillsResource.value() ?? [];
    if (bills.length === 0) {
      this.toastr.warning('Please add at least one bill to create a claim', 'Warning');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.voucherForm.value;
      const payload = {
        type: 3, // Hired
        billIds: bills.map(b => b.id),
        forwardedToTreasury: formValue.forwardedToTreasury === 'yes',
        subVoucherNo: formValue.subVoucherNo,
        subVoucherDescription: formValue.subVoucherDescription,
        sanctionOrderNo: formValue.sanctionOrderNo,
        sanctionOrderDate: formValue.sanctionOrderDate,
        sanctionAuthority: formValue.sanctionAuthority,
        firmName: formValue.firmName,
        tax: formValue.tax
      };

      await firstValueFrom(this.billingService.createClaim(payload));
      this.toastr.success('Hired vehicle claim created and submitted', 'Success');
      this.router.navigate(['/bill-voucher']);
    } catch (error) {
      this.toastr.error('Failed to create claim', 'Error');
    } finally {
      this.isLoading.set(false);
    }
  }

  resetBillFields(): void {
    this.voucherForm.patchValue({
      billNumber: '',
      billDate: new Date().toISOString().split('T')[0],
      vehicleNumber: '',
      contractorName: '',
      contractorPhone: '',
      noOfVehicles: 1,
      kmCovered: 0,
      amount: '',
      hiredFrom: '',
      hiredTo: ''
    });
  }

  get totalBillAmount(): number {
    return (this.draftedBillsResource.value() ?? []).reduce((sum, b) => sum + b.amount, 0);
  }
}
