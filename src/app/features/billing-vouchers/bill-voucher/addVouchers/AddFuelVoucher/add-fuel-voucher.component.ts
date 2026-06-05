import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BillingService, BillType, FuelVoucher } from '@shared/services/billing.service';
import { UploadService } from '@shared/services/upload.service';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

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
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private billingService = inject(BillingService);
  private uploadService = inject(UploadService);

  voucherForm: FormGroup;
  isLoading = signal(false);
  
  // Smart Form State Signals
  fitnessRequired = signal(false);
  permissionRequired = signal(false);
  lastReading = signal(0);

  // Personal Usage State
  showPersonalUsageModal = signal(false);
  personalUsagePlanId = signal<number>(1);
  personalUseForm!: FormGroup;
  isSavingUsage = signal(false);

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
      variant: 'danger',
      icon: '<i class="pi pi-trash"></i>'
    }
  ];

  constructor() {
    this.voucherForm = this.fb.group({
      // Header Details
      forwardedToTreasury: ['yes', Validators.required],
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
      sanctionPermissionFile: [''],
      sanctionAuthorityMobileNo: ['', [Validators.pattern('^[0-9]{10}$')]],
      fuelBillId: [0]
    });

    this.personalUseForm = this.fb.group({
      dateOfUse: ['', Validators.required],
      omFrom: ['', [Validators.required, Validators.min(0)]],
      omTo: ['', [Validators.required, Validators.min(0)]],
    });
    
    // Subscribe to toggle fields
    this.voucherForm.get('forwardedToTreasury')?.valueChanges.subscribe(value => {
      this.toggleVoucherFields(value === 'yes');
    });
    // Initial state
    this.toggleVoucherFields(this.voucherForm.get('forwardedToTreasury')?.value === 'yes');
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const isViewOnly = this.route.snapshot.queryParamMap.get('view') === 'true';
    
    // Restore header details from localStorage if they exist
    const savedHeader = localStorage.getItem('fuelVoucherDraftHeader');
    if (savedHeader && !isViewOnly) {
      try {
        const parsed = JSON.parse(savedHeader);
        this.voucherForm.patchValue(parsed, { emitEvent: false });
      } catch (e) {}
    }

    // Subscribe to form changes to save header details
    this.voucherForm.valueChanges.subscribe(val => {
      const headerFields = {
        forwardedToTreasury: val.forwardedToTreasury,
        subVoucherNo: val.subVoucherNo,
        subVoucherDescription: val.subVoucherDescription,
        sanctionOrderNo: val.sanctionOrderNo,
        sanctionOrderDate: val.sanctionOrderDate,
        sanctionAuthority: val.sanctionAuthority,
        firmName: val.firmName,
        tax: val.tax,
        sanctionAuthorityMobileNo: val.sanctionAuthorityMobileNo
      };
      localStorage.setItem('fuelVoucherDraftHeader', JSON.stringify(headerFields));
    });

    if (id) {
      this.loadBill(Number(id), isViewOnly);
    }
  }

  async loadBill(id: number, isViewOnly: boolean = false): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(this.billingService.getFuelBillById(id));
      if (res) {
        this.voucherForm.patchValue({
          ...res,
          billDate: res.billDate ? new Date(res.billDate).toISOString().split('T')[0] : '',
          nocIssueDate: res.nocIssueDate ? new Date(res.nocIssueDate).toISOString().split('T')[0] : '',
          nocExpiryDate: res.nocExpiryDate ? new Date(res.nocExpiryDate).toISOString().split('T')[0] : '',
          fuelBillId: res.fuelBillId
        });
        
        // Disable form if view-only or already linked to a claim
        if (isViewOnly || res.claimId) {
          this.voucherForm.disable();
          if (res.claimId && !isViewOnly) {
            this.toastr.info('This bill is already part of a claim and cannot be edited.', 'Read Only');
          }
        }
      }
    } catch (error) {
      this.toastr.error('Failed to load bill details', 'Error');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleVoucherFields(enabled: boolean): void {
    const fields = ['subVoucherNo', 'subVoucherDescription', 'sanctionOrderNo', 'sanctionOrderDate', 'sanctionAuthority', 'firmName'];
    fields.forEach(field => {
      const control = this.voucherForm.get(field);
      if (enabled) {
        control?.enable();
        control?.setValidators([Validators.required]);
      } else {
        control?.disable();
        control?.clearValidators();
        control?.setValue(''); // Clear if disabled
      }
      control?.updateValueAndValidity();
    });
  }


  async onVehicleChange(vehicleId: any): Promise<void> {
    if (!vehicleId) return;
    
    // --- 1. 30-Day Verification Check for Earmarked Vehicles ---
    const selectedVehicle = this.vehiclesResource.value()?.find(v => v.id === vehicleId);
    if (selectedVehicle) {
      const allocationType = selectedVehicle.vehicleAllocationType?.toLowerCase() || '';
      
      if (allocationType.includes('earmarked')) {
        const verificationDate = selectedVehicle.verificationDate ? new Date(selectedVehicle.verificationDate) : null;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // If not verified or verified more than 30 days ago
        if (!verificationDate || verificationDate < thirtyDaysAgo) {
          const result = await Swal.fire({
            title: 'WARNING: Confirm Allotment',
            html: `Please ensure that this vehicle is allotted to the given officer:<br><br>` +
                  `<b>${selectedVehicle.officerName || 'Unknown Officer'}</b><br><br>` +
                  `Strict action will be taken against the DDO if wrong bills are submitted.<br><br>` +
                  `Click <b>Confirm</b> to verify ownership, or <b>Reject</b> to mark as Unverified.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm Ownership',
            cancelButtonText: 'Reject'
          });
          
          if (result.isConfirmed) {
            try {
              await firstValueFrom(this.billingService.verifyVehicle(vehicleId));
              this.toastr.success('Vehicle ownership verified successfully!', 'Verified');
              // Update local state so it doesn't prompt again during this session
              selectedVehicle.verificationDate = new Date().toISOString();
            } catch (error) {
              this.toastr.error('Failed to verify vehicle ownership.', 'Error');
            }
          } else {
            try {
               await firstValueFrom(this.billingService.rejectVehicle(vehicleId, 'DDO denied ownership during 30-day verification.'));
               this.toastr.warning('Vehicle marked as Unverified.', 'Unverified');
               this.voucherForm.get('vehicleId')?.reset(); // Reset dropdown
               return; // Stop execution, do not fetch odometer reading
            } catch (error) {
               this.toastr.error('Failed to unverify vehicle.', 'Error');
            }
          }
        }
      }
    }

    // --- 2. Fetch last reading for validation ---
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

    if (!vehicleId || litres === null || litres === undefined || litres === '') return;

    // Check Permission NOC based on Litres only for Fuel (Matching legacy logic)
    const isRequired = await firstValueFrom(this.billingService.checkPermission(vehicleId, BillType.Fuel, litres));
    this.permissionRequired.set(isRequired);

    const mobileCtrl = this.voucherForm.get('sanctionAuthorityMobileNo');
    if (isRequired) {
      mobileCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{10}$')]);
    } else {
      mobileCtrl?.setValidators([Validators.pattern('^[0-9]{10}$')]);
    }
    mobileCtrl?.updateValueAndValidity();
  }

  async addBillAndSaveAsDraft(): Promise<void> {
    if (this.voucherForm.invalid) {
      this.toastr.error('Please fill all required fields', 'Error');
      return;
    }

    // --- Condemned Vehicle Validation ---
    const vehicleId = this.voucherForm.get('vehicleId')?.value;
    const selectedVehicle = this.vehiclesResource.value()?.find(v => v.id === vehicleId);
    
    if (selectedVehicle && selectedVehicle.currentStatus?.toUpperCase() === 'CONDEMNED') {
      const condemnedDate = selectedVehicle.updatedAt ? new Date(selectedVehicle.updatedAt) : new Date();
      const fuelDate = new Date(this.voucherForm.get('billDate')?.value);
      
      if (fuelDate > condemnedDate) {
        this.toastr.warning('Fuel date cannot be greater than the Condemned date.', 'Vehicle Condemned');
        return;
      }
    }

    this.isLoading.set(true);
    try {
      const payload = { ...this.voucherForm.value };

      // Upload files if they exist as File objects
      if (payload.nocFile instanceof File) {
        const uploadRes = await firstValueFrom(this.uploadService.uploadFile(payload.nocFile, 'billing/noc'));
        payload.nocFile = uploadRes.dbPath;
      }
      
      if (payload.sanctionPermissionFile instanceof File) {
        const uploadRes = await firstValueFrom(this.uploadService.uploadFile(payload.sanctionPermissionFile, 'billing/sanctions'));
        payload.sanctionPermissionFile = uploadRes.dbPath;
      }

      // Convert empty strings to null for nullable backend fields (like dates)
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      await firstValueFrom(this.billingService.saveBill(BillType.Fuel, payload));
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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this drafted bill? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      await firstValueFrom(this.billingService.deleteBill(BillType.Fuel, voucher.fuelBillId));
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

    // Validate only header/sanction fields (ignore empty bill-entry fields at the bottom)
    const headerFields = ['forwardedToTreasury', 'subVoucherNo', 'subVoucherDescription', 'sanctionOrderNo', 'sanctionOrderDate', 'sanctionAuthority', 'firmName', 'tax'];
    const isHeaderInvalid = headerFields.some(field => {
      const control = this.voucherForm.get(field);
      return control && control.enabled && control.invalid;
    });

    if (isHeaderInvalid) {
      this.toastr.error('Please fill all required sanction details before locking', 'Error');
      // Mark fields as touched to show validation errors
      headerFields.forEach(field => this.voucherForm.get(field)?.markAsTouched());
      return;
    }

    // Legacy-style Attention Warning using SweetAlert2
    const result = await Swal.fire({
      title: 'ATTENTION!',
      html: `You will not be able to edit or update the bills once you lock them for Submission. <br><br>` +
            `Please be very careful and cross-check the values before submission.<br><br>` +
            `<b>You are submitting a voucher of ₹${this.totalBillAmount} with ${bills.length} bill(s).</b><br><br>` +
            `Do you want to proceed?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Lock & Submit!',
      cancelButtonText: 'No, Wait'
    });

    if (!result.isConfirmed) return;

    this.isLoading.set(true);
    try {
      const formValue = this.voucherForm.getRawValue(); // Use getRawValue to include disabled fields if any
      const payload = {
        type: 1, // Fuel
        billIds: bills.map(b => b.fuelBillId),
        forwardedToTreasury: formValue.forwardedToTreasury === 'yes',
        subVoucherNo: formValue.subVoucherNo,
        subVoucherDescription: formValue.subVoucherDescription,
        sanctionOrderNo: formValue.sanctionOrderNo,
        sanctionOrderDate: formValue.sanctionOrderDate,
        sanctionAuthority: formValue.sanctionAuthority,
        firmName: formValue.firmName,
        tax: formValue.tax
      };

      // Convert empty strings to null for nullable backend fields
      Object.keys(payload).forEach(key => {
        if ((payload as any)[key] === '') (payload as any)[key] = null;
      });

      await firstValueFrom(this.billingService.createClaim(payload));
      this.toastr.success('Claim created and submitted for verification', 'Success');
      localStorage.removeItem('fuelVoucherDraftHeader');
      this.router.navigate(['/bill-voucher']);
    } catch (error) {
      this.toastr.error('Failed to create claim', 'Error');
    } finally {
      this.isLoading.set(false);
    }
  }

  resetBillFields(): void {
    const formValue = this.voucherForm.getRawValue();
    this.voucherForm.reset({
      // Preserve Header/Sanction Details
      forwardedToTreasury: formValue.forwardedToTreasury,
      subVoucherNo: formValue.subVoucherNo,
      subVoucherDescription: formValue.subVoucherDescription,
      sanctionOrderNo: formValue.sanctionOrderNo,
      sanctionOrderDate: formValue.sanctionOrderDate,
      sanctionAuthority: formValue.sanctionAuthority,
      firmName: formValue.firmName,
      tax: formValue.tax,
      sanctionAuthorityMobileNo: formValue.sanctionAuthorityMobileNo,

      // Reset specific Bill Details
      vehicleId: formValue.vehicleId, // Keep same vehicle for convenience
      billNumber: '',
      billDate: new Date().toISOString().split('T')[0],
      odometerReading: '',
      fuelQuantity: '',
      amount: '',
      fuelBillId: 0,
      nocFile: '',
      nocIssueDate: '',
      nocExpiryDate: '',
      sanctionPermissionFile: ''
    });
    this.fitnessRequired.set(false);
    this.permissionRequired.set(false);
  }

  get totalBillAmount(): number {
    return (this.draftedVouchersResource.value() ?? []).reduce((sum, b) => sum + b.amount, 0);
  }

  async savePersonalUsage(): Promise<void> {
    if (this.personalUseForm.invalid) {
      this.toastr.error('Please fill all required personal usage fields', 'Error');
      return;
    }

    const vehicleId = this.voucherForm.get('vehicleId')?.value;
    if (!vehicleId) {
      this.toastr.warning('Please select a vehicle first', 'Warning');
      return;
    }

    const selectedVehicle = this.vehiclesResource.value()?.find(v => v.id === vehicleId);
    
    this.isSavingUsage.set(true);
    try {
      const formValue = this.personalUseForm.value;
      const payload = {
        record_id: `REC-${Date.now()}`, // Simulated Record ID
        item_id: `ITEM-${Date.now()}`,   // Simulated Item ID
        plan_id: this.personalUsagePlanId(),
        vehicle_info_id: vehicleId,
        vehicle_no: selectedVehicle?.registrationNumber || '',
        personal_use_details: JSON.stringify([{
          OfficerId: selectedVehicle?.officerId || '00000000-0000-0000-0000-000000000000',
          DateOfUse: formValue.dateOfUse,
          OMFrom: formValue.omFrom,
          OMTo: formValue.omTo
        }])
      };

      await firstValueFrom(this.billingService.insertPersonalUseDetails(payload));
      this.toastr.success('Personal Usage details saved successfully!', 'Success');
      this.showPersonalUsageModal.set(false);
      this.personalUseForm.reset();
    } catch (error: any) {
      this.toastr.error(error.error?.msg || 'Failed to save personal usage details', 'Error');
    } finally {
      this.isSavingUsage.set(false);
    }
  }
}
