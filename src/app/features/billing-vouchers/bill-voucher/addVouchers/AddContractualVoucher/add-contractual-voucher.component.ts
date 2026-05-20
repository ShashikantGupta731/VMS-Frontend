import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BillingService, BillType, ContractualBill } from '@shared/services/billing.service';
import { MasterService } from '@core/services/master';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-contractual-voucher',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AppButtonComponent, AppDataTableComponent, AppInputComponent],
  templateUrl: './add-contractual-voucher.component.html',
  styleUrl: './add-contractual-voucher.component.scss'
})
export class AddContractualVoucherComponent implements OnInit {
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
  draftedBillsResource = rxResource<ContractualBill[], any>({
    stream: () => this.billingService.getDrafts(BillType.Contractual)
  });

  // Table columns
  tableColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill No.' },
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'billDate', label: 'Date' },
    { key: 'billPeriodFrom', label: 'From' },
    { key: 'billPeriodTo', label: 'To' },
    { key: 'amount', label: 'Amount (₹)' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'Delete',
      action: (row: ContractualBill) => this.deleteDraft(row),
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
      contractualBillId: [0],
      billNumber: ['', Validators.required],
      billDate: [new Date().toISOString().split('T')[0], Validators.required],
      billPeriodFrom: ['', Validators.required],
      billPeriodTo: ['', Validators.required],
      officeName: ['', Validators.required],
      vehicleType: ['', Validators.required],
      ddoCode: ['', Validators.required],
      vehicleNumber: ['', Validators.required],
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
    this.headerForm.valueChanges.subscribe(value => {
      if (!this.isViewMode() && !this.currentBillId()) {
        localStorage.setItem('vms_contractual_header_draft', JSON.stringify(value));
      }
    });
  }

  private restoreHeaderFromStorage(): void {
    const savedHeader = localStorage.getItem('vms_contractual_header_draft');
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
    localStorage.removeItem('vms_contractual_header_draft');
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
      const drafts: ContractualBill[] = await firstValueFrom(this.billingService.getDrafts(BillType.Contractual));
      const bill = drafts.find((b: ContractualBill) => b.contractualBillId === id);

      if (bill) {
        this.billForm.patchValue({
          contractualBillId: bill.contractualBillId,
          billNumber: bill.billNumber,
          billDate: bill.billDate?.split('T')[0],
          billPeriodFrom: bill.billPeriodFrom?.split('T')[0],
          billPeriodTo: bill.billPeriodTo?.split('T')[0],
          officeName: bill.officeName,
          vehicleType: bill.vehicleType,
          ddoCode: bill.ddoCode,
          vehicleNumber: bill.vehicleNumber,
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

      this.officeOptions.set(offices.map((o: any) => ({ label: o.officeName, value: o.officeName })));
      this.vehicleTypeOptions.set(types.map((t: any) => ({ label: t.name, value: t.name })));
    } catch (error) {
      this.toastr.error('Failed to load master data', 'Error');
    }
  }

  async addBillAndSaveAsDraft(): Promise<void> {
    if (this.billForm.invalid) {
      this.toastr.error('Please fill all required bill details', 'Error');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.billForm.value;
      const payload = {
        contractualBillId: formValue.contractualBillId || 0,
        billNumber: formValue.billNumber,
        billDate: formValue.billDate,
        billPeriodFrom: formValue.billPeriodFrom,
        billPeriodTo: formValue.billPeriodTo,
        officeName: formValue.officeName,
        vehicleType: formValue.vehicleType,
        ddoCode: formValue.ddoCode,
        vehicleNumber: formValue.vehicleNumber,
        amount: Number(formValue.amount)
      };

      await firstValueFrom(this.billingService.saveBill(BillType.Contractual, payload));
      this.toastr.success('Contractual bill saved as draft', 'Success');
      this.draftedBillsResource.reload();
      this.resetBillFields();
    } catch (error: any) {
      this.toastr.error(error.error?.msg || 'Failed to save bill', 'Error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteDraft(voucher: ContractualBill): Promise<void> {
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
        await firstValueFrom(this.billingService.deleteBill(BillType.Contractual, voucher.contractualBillId));
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
          type: 4, // Contractual
          billIds: bills.map((b: ContractualBill) => b.contractualBillId),
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
          text: 'The contractual vehicle claim has been submitted successfully.',
          timer: 2000,
          showConfirmButton: false
        });

        this.router.navigate(['/contractual-requisite-vehicle-voucher']);
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
      contractualBillId: 0,
      billNumber: '',
      billDate: new Date().toISOString().split('T')[0],
    });
  }

  get totalBillAmount(): number {
    return (this.draftedBillsResource.value() ?? []).reduce((sum: number, b: ContractualBill) => sum + b.amount, 0);
  }
}

