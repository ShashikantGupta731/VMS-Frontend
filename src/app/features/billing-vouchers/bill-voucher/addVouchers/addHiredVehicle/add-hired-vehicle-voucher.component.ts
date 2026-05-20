import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BillingService, BillType, HiredVehicleBill } from '@shared/services/billing.service';
import { MasterService } from '@core/services/master';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

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
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private billingService = inject(BillingService);
  private masterService = inject(MasterService);

  headerForm: FormGroup;
  billForm: FormGroup;
  isLoading = signal(false);
  isViewMode = signal(false);
  currentBillId = signal<number | null>(null);

  // Dynamic Options
  officeOptions = signal<{ label: string, value: string }[]>([]);
  vehicleTypeOptions = signal<{ label: string, value: string }[]>([]);

  // Table for currently drafted bills
  draftedBillsResource = rxResource<HiredVehicleBill[], any>({
    stream: () => this.billingService.getDrafts(BillType.Hired)
  });

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
    this.headerForm = this.fb.group({
      forwardedToTreasury: ['no', Validators.required],
      subVoucherNo: ['', Validators.required],
      subVoucherDescription: ['', Validators.required],
      sanctionOrderNo: ['', Validators.required],
      sanctionOrderDate: [new Date().toISOString().split('T')[0], Validators.required],
      sanctionAuthority: ['', Validators.required],
      firmName: ['', Validators.required],
      tax: [0, [Validators.required, Validators.min(0)]],
    });

    this.billForm = this.fb.group({
      hiredVehicleBillId: [0],
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

  ngOnInit(): void {
    this.loadDropdowns();
    this.checkViewMode();
    this.restoreHeaderFromStorage();
    this.setupHeaderPersistence();
  }

  private setupHeaderPersistence(): void {
    // Automatically save header details to local storage as the user types
    this.headerForm.valueChanges.subscribe(value => {
      if (!this.isViewMode() && !this.currentBillId()) {
        localStorage.setItem('vms_hired_header_draft', JSON.stringify(value));
      }
    });
  }

  private restoreHeaderFromStorage(): void {
    const savedHeader = localStorage.getItem('vms_hired_header_draft');
    if (savedHeader) {
      try {
        const parsed = JSON.parse(savedHeader);
        this.headerForm.patchValue(parsed, { emitEvent: false });
      } catch (e) {
        console.error('Failed to restore header from storage', e);
      }
    }
  }

  private clearHeaderStorage(): void {
    localStorage.removeItem('vms_hired_header_draft');
  }

  private checkViewMode(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    const mode = this.route.snapshot.queryParamMap.get('mode');

    if (id) {
      this.currentBillId.set(+id);
      this.isViewMode.set(mode === 'view');
      this.loadBillData(+id);
    }
  }

  private async loadBillData(id: number): Promise<void> {
    this.isLoading.set(true);
    try {
      const drafts = await firstValueFrom(this.billingService.getDrafts(BillType.Hired));
      const bill = drafts.find(b => b.hiredVehicleBillId === id);

      if (bill) {
        this.billForm.patchValue({
          hiredVehicleBillId: bill.hiredVehicleBillId,
          billNumber: bill.billNumber,
          billDate: bill.billDate?.split('T')[0],
          officeName: bill.officeName,
          contractorName: bill.contractorName,
          contractorPhone: bill.contractorPhone,
          vehicleType: bill.vehicleType,
          noOfVehicles: bill.noOfVehicles,
          vehicleNumber: bill.vehicleNumber,
          hiredFrom: bill.hiredFrom?.split('T')[0],
          hiredTo: bill.hiredTo?.split('T')[0],
          kmCovered: bill.kmCovered,
          amount: bill.amount
        });

        if (this.isViewMode()) {
          this.billForm.disable();
          this.headerForm.disable();
        } else {
          this.billForm.enable();
          this.headerForm.enable();
        }
      }
    } catch (error) {
      this.toastr.error('Failed to load bill details', 'Error');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadDropdowns(): Promise<void> {
    try {
      const [offices, types] = await Promise.all([
        firstValueFrom(this.masterService.getOffices()),
        firstValueFrom(this.masterService.getVehicleTypes())
      ]);

      this.officeOptions.set(offices.map(o => ({ label: o.officeName, value: o.officeName })));
      this.vehicleTypeOptions.set(types.map(t => ({ label: t.name, value: t.name })));
    } catch (error) {
      this.toastr.error('Failed to load master data', 'Error');
    }
  }

  private validateVehicleCount(): boolean {
    const regNumbers = this.billForm.get('vehicleNumber')?.value || '';
    const expectedCount = this.billForm.get('noOfVehicles')?.value || 0;
    const list = regNumbers.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    
    if (list.length !== expectedCount) {
      Swal.fire({
        icon: 'error',
        title: 'Vehicle Count Mismatch',
        text: `You have entered ${list.length} registration numbers, but the count is set to ${expectedCount}. Please correct it.`,
        confirmButtonColor: '#d33'
      });
      return false;
    }
    return true;
  }

  async addBillAndSaveAsDraft(): Promise<void> {
    if (this.billForm.invalid) {
      this.toastr.error('Please fill all required bill details', 'Error');
      return;
    }

    if (!this.validateVehicleCount()) return;

    this.isLoading.set(true);
    try {
      const formValue = this.billForm.value;
      const payload = {
        hiredVehicleBillId: formValue.hiredVehicleBillId || 0,
        billNumber: formValue.billNumber,
        billDate: formValue.billDate,
        officeName: formValue.officeName,
        contractorName: formValue.contractorName,
        contractorPhone: formValue.contractorPhone,
        vehicleType: formValue.vehicleType,
        noOfVehicles: Number(formValue.noOfVehicles),
        vehicleNumber: formValue.vehicleNumber,
        hiredFrom: formValue.hiredFrom,
        hiredTo: formValue.hiredTo,
        kmCovered: Number(formValue.kmCovered),
        amount: Number(formValue.amount)
      };

      await firstValueFrom(this.billingService.saveBill(BillType.Hired, payload));
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
    const result = await Swal.fire({
      title: 'Delete Draft?',
      text: `Are you sure you want to delete Bill #${voucher.billNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await firstValueFrom(this.billingService.deleteBill(BillType.Hired, voucher.hiredVehicleBillId));
        this.draftedBillsResource.reload();
        this.toastr.success('Draft deleted successfully', 'Success');
      } catch (error) {
        this.toastr.error('Failed to delete draft', 'Error');
      }
    }
  }

  async lockBills(): Promise<void> {
    const bills = this.draftedBillsResource.value() ?? [];
    if (bills.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Voucher',
        text: 'Please add at least one bill before locking.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (this.headerForm.invalid) {
      this.toastr.error('Please fill all Sanction/Header details before locking', 'Validation Error');
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Lock',
      text: "Are you sure you want to lock these bills? You won't be able to add more bills to this claim once locked.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Lock & Submit'
    });

    if (result.isConfirmed) {
      this.isLoading.set(true);
      try {
        const formValue = this.headerForm.value;
        const payload = {
          type: 3, // Hired
          billIds: bills.map((b: HiredVehicleBill) => b.hiredVehicleBillId),
          forwardedToTreasury: formValue.forwardedToTreasury === 'yes',
          subVoucherNo: formValue.subVoucherNo,
          subVoucherDescription: formValue.subVoucherDescription,
          sanctionOrderNo: formValue.sanctionOrderNo,
          sanctionOrderDate: formValue.sanctionOrderDate ? formValue.sanctionOrderDate : null,
          sanctionAuthority: formValue.sanctionAuthority,
          firmName: formValue.firmName,
          tax: Number(formValue.tax || 0)
        };

        await firstValueFrom(this.billingService.createClaim(payload));
        this.clearHeaderStorage();
        
        await Swal.fire({
          icon: 'success',
          title: 'Locked!',
          text: 'The hired vehicle claim has been submitted successfully.',
          timer: 2000,
          showConfirmButton: false
        });

        this.router.navigate(['/hired-vehicle-voucher']);
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Locking Failed',
          text: error.error?.msg || 'An error occurred while creating the claim.'
        });
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  resetBillFields(): void {
    this.currentBillId.set(null);
    this.billForm.reset({
      hiredVehicleBillId: 0,
      billNumber: '',
      billDate: new Date().toISOString().split('T')[0],
      noOfVehicles: 1,
      kmCovered: 0
    });
  }

  get totalBillAmount(): number {
    return (this.draftedBillsResource.value() ?? []).reduce((sum: number, b: HiredVehicleBill) => sum + b.amount, 0);
  }
}


