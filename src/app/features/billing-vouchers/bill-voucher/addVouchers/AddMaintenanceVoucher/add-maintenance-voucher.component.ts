import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BillingService, BillType, MaintenanceBill } from '@shared/services/billing.service';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-maintenance-voucher',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AppButtonComponent, AppDataTableComponent, AppInputComponent],
  templateUrl: './add-maintenance-voucher.component.html',
  styleUrl: './add-maintenance-voucher.component.scss'
})
export class AddMaintenanceVoucherComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private billingService = inject(BillingService);

  voucherForm: FormGroup;
  isLoading = signal(false);
  
  // Smart Form State Signals
  permissionRequired = signal(false);
  lastReading = signal(0);

  // Load vehicles for current DDO
  // Note: Reusing the same vehicles endpoint for now
  vehiclesResource = rxResource<any[], any>({
    stream: () => this.billingService.getDdoVehicles()
  });

  vehicleOptions = computed(() => {
    return (this.vehiclesResource.value() ?? []).map(v => ({
      label: v.registrationNumber,
      value: v.id
    }));
  });

  // Maintenance type options
  maintenanceTypeOptions = [
    { label: 'Service', value: 'Service' },
    { label: 'Battery Change', value: 'Battery Change' },
    { label: 'Routine Repair', value: 'Routine Repair' },
    { label: 'Major Repair', value: 'Major Repair' },
    { label: 'Tyre Change', value: 'Tyre Change' },
  ];

  // Table for currently drafted bills
  draftedBillsResource = rxResource<MaintenanceBill[], any>({
    stream: () => this.billingService.getDrafts(BillType.Maintenance)
  });

  tableColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill No.' },
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'billDate', label: 'Date' },
    { key: 'odometerReading', label: 'Odometer (Km)' },
    { key: 'maintenanceType', label: 'Type' },
    { key: 'amount', label: 'Amount (₹)' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'Delete',
      action: (row: MaintenanceBill) => this.deleteDraft(row),
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
      maintenanceType: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      repairDetails: [''],
      sanctionPermissionFile: ['']
    });
  }

  ngOnInit(): void {}

  async onVehicleChange(vehicleId: any): Promise<void> {
    if (!vehicleId) return;
    
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
    const odometer = this.voucherForm.get('odometerReading')?.value;
    if (odometer && odometer <= this.lastReading()) {
      this.toastr.warning(`Current reading (${odometer}) must be greater than last reading (${this.lastReading()})`, 'Validation');
    }
  }

  async onAmountBlur(): Promise<void> {
    const vehicleId = this.voucherForm.get('vehicleId')?.value;
    const amount = this.voucherForm.get('amount')?.value;

    if (!vehicleId || !amount) return;

    // Check Permission NOC based on Amount (Type 2 = Maintenance)
    this.permissionRequired.set(await firstValueFrom(this.billingService.checkPermission(vehicleId, BillType.Maintenance, amount)));
  }

  async addBillAndSaveAsDraft(): Promise<void> {
    if (this.voucherForm.invalid) {
      this.toastr.error('Please fill all required fields', 'Error');
      return;
    }

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.billingService.saveBill(BillType.Maintenance, this.voucherForm.value));
      this.toastr.success('Maintenance bill saved as draft', 'Success');
      this.draftedBillsResource.reload();
      this.resetBillFields();
    } catch (error: any) {
      this.toastr.error(error.error?.msg || 'Failed to save bill', 'Error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteDraft(voucher: MaintenanceBill): Promise<void> {
    if (confirm('Are you sure you want to delete this drafted bill?')) {
      await firstValueFrom(this.billingService.deleteBill(BillType.Maintenance, voucher.id));
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
        type: 2, // Maintenance
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
      this.toastr.success('Maintenance claim created and submitted', 'Success');
      this.router.navigate(['/maintenance-voucher']);
    } catch (error) {
      this.toastr.error('Failed to create claim', 'Error');
    } finally {
      this.isLoading.set(false);
    }
  }

  resetBillFields(): void {
    const vehicleId = this.voucherForm.get('vehicleId')?.value;
    this.voucherForm.reset({
      vehicleId: vehicleId,
      billDate: new Date().toISOString().split('T')[0],
      odometerReading: '',
      maintenanceType: '',
      amount: '',
      repairDetails: ''
    });
    this.permissionRequired.set(false);
  }

  get totalBillAmount(): number {
    return (this.draftedBillsResource.value() ?? []).reduce((sum, b) => sum + b.amount, 0);
  }
}
