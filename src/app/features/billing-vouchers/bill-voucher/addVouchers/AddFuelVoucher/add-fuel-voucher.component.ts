import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BillingService, BillType, FuelVoucher } from '@shared/services/billing.service';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-fuel-voucher',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AppButtonComponent, AppDataTableComponent, AppInputComponent],
  templateUrl: './add-fuel-voucher.component.html',
  styleUrl: './add-fuel-voucher.component.scss'
})
export class AddFuelVoucherComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private billingService = inject(BillingService);

  voucherForm: FormGroup;
  isLoading = signal(false);
  
  // Smart Form State Signals
  fitnessRequired = signal(false);
  permissionRequired = signal(false);
  lastReading = signal(0);

  // Load vehicles for current DDO
  vehiclesResource = rxResource<any[], any>({
    stream: () => this.billingService.getDdoVehicles()
  });

  vehicleOptions = computed(() => {
    return (this.vehiclesResource.value() ?? []).map(v => ({
      label: v.registrationNumber,
      value: v.id
    }));
  });

  // Table for currently drafted bills
  draftedVouchersResource = rxResource<FuelVoucher[], any>({
    stream: () => this.billingService.getDrafts(BillType.Fuel)
  });

  tableColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill No.' },
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'billDate', label: 'Date' },
    { key: 'odometerReading', label: 'Odometer (Km)' },
    { key: 'fuelQuantity', label: 'Litres' },
    { key: 'amount', label: 'Amount (₹)' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'Delete',
      action: (row: FuelVoucher) => this.deleteDraft(row),
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
      vehicleId: ['', Validators.required],
      billNumber: ['', Validators.required],
      billDate: [new Date().toISOString().split('T')[0], Validators.required],
      odometerReading: ['', [Validators.required, Validators.min(0)]],
      fuelQuantity: ['', [Validators.required, Validators.min(0.1)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      nocFile: [''],
      nocIssueDate: [''],
      nocExpiryDate: [''],
      sanctionPermissionFile: ['']
    });
  }

  ngOnInit(): void {}

  async onVehicleChange(vehicleId: any): Promise<void> {
    if (!vehicleId) return;
    
    // Fetch last reading for validation
    try {
      const billDate = this.voucherForm.get('billDate')?.value;
      const validation = await firstValueFrom(this.billingService.getOdometerValidation(vehicleId, billDate));
      this.lastReading.set(validation.lastReading);
      this.toastr.info(`Last Odometer Reading: ${this.lastReading()} Km`, 'Info');
    } catch (error) {
      console.error('Error fetching odometer validation', error);
    }
  }

  async onOdometerBlur(): Promise<void> {
    const vehicleId = this.voucherForm.get('vehicleId')?.value;
    const odometer = this.voucherForm.get('odometerReading')?.value;

    if (!vehicleId || !odometer) return;

    if (odometer <= this.lastReading()) {
      this.toastr.warning(`Current reading (${odometer}) must be greater than last reading (${this.lastReading()})`, 'Validation');
    }

    // Check if Fitness Certificate is needed
    this.fitnessRequired.set(await firstValueFrom(this.billingService.checkFitness(vehicleId, odometer)));
  }

  async onAmountBlur(): Promise<void> {
    const vehicleId = this.voucherForm.get('vehicleId')?.value;
    const amount = this.voucherForm.get('amount')?.value;
    const litres = this.voucherForm.get('fuelQuantity')?.value;

    if (!vehicleId) return;

    // Check Permission NOC based on Litres or Amount (Backend logic handles which one)
    const checkValue = Math.max(amount, litres); // Simple proxy for logic
    this.permissionRequired.set(await firstValueFrom(this.billingService.checkPermission(vehicleId, BillType.Fuel, checkValue)));
  }

  async addBillAndSaveAsDraft(): Promise<void> {
    if (this.voucherForm.invalid) {
      this.toastr.error('Please fill all required fields', 'Error');
      return;
    }

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.billingService.saveBill(BillType.Fuel, this.voucherForm.value));
      this.toastr.success('Bill saved as draft', 'Success');
      this.draftedVouchersResource.reload();
      this.resetBillFields();
    } catch (error: any) {
      this.toastr.error(error.error?.msg || 'Failed to save bill', 'Error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteDraft(voucher: FuelVoucher): Promise<void> {
    if (confirm('Are you sure you want to delete this drafted bill?')) {
      await firstValueFrom(this.billingService.deleteBill(BillType.Fuel, voucher.id));
      this.draftedVouchersResource.reload();
      this.toastr.success('Draft deleted', 'Success');
    }
  }

  async lockBills(): Promise<void> {
    const bills = this.draftedVouchersResource.value() ?? [];
    if (bills.length === 0) {
      this.toastr.warning('Please add at least one bill to create a claim', 'Warning');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.voucherForm.value;
      const payload = {
        type: 1, // Fuel
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
      this.toastr.success('Claim created and submitted for verification', 'Success');
      this.router.navigate(['/bill-voucher']);
    } catch (error) {
      this.toastr.error('Failed to create claim', 'Error');
    } finally {
      this.isLoading.set(false);
    }
  }

  resetBillFields(): void {
    const vehicleId = this.voucherForm.get('vehicleId')?.value;
    this.voucherForm.reset({
      vehicleId: vehicleId, // Keep the vehicle selected for the next bill
      billDate: new Date().toISOString().split('T')[0],
      odometerReading: '',
      fuelQuantity: '',
      amount: ''
    });
    this.fitnessRequired.set(false);
    this.permissionRequired.set(false);
  }

  get totalBillAmount(): number {
    return (this.draftedVouchersResource.value() ?? []).reduce((sum, b) => sum + b.amount, 0);
  }
}
