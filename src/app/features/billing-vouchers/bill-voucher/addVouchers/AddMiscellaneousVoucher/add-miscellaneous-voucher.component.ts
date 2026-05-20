import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { BillingService, BillType, MiscellaneousBill } from '@shared/services/billing.service';
import { MasterService, DropdownItem, InventoryItem } from '@core/services/master';
import Swal from 'sweetalert2';
import { firstValueFrom, BehaviorSubject, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-add-miscellaneous-voucher',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AppButtonComponent, AppDataTableComponent, AppInputComponent],
  templateUrl: './add-miscellaneous-voucher.component.html',
  styleUrl: './add-miscellaneous-voucher.component.scss'
})
export class AddMiscellaneousVoucherComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private billingService = inject(BillingService);
  private masterService = inject(MasterService);

  headerForm: FormGroup;
  billForm: FormGroup;
  isViewMode = false;
  isEditMode = false;
  currentClaimId = signal<number | null>(null);
  isLoading = signal(false);
  selectedInventoryId = signal<number | null>(null);
  
  showModel = computed(() => {
    const id = this.selectedInventoryId();
    if (!id) return false;
    const selectedItem = this.stockItems().find(item => item.id === id);
    return selectedItem?.isModelRequired ?? false;
  });

  private refreshBills$ = new BehaviorSubject<void>(undefined);

  // --- Dynamic Data Resources ---
  stockItems = toSignal(this.masterService.getInventoryItems(), { initialValue: [] as InventoryItem[] });

  draftedBills = toSignal(
    this.refreshBills$.pipe(
      switchMap(() => this.billingService.getDrafts(BillType.Miscellaneous))
    ),
    { initialValue: [] as MiscellaneousBill[] }
  );

  tableColumns: TableColumn[] = [
    { key: 'billNumber', label: 'Bill Number' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'inventoryName', label: 'Item Name' },
    { key: 'modelNumber', label: 'Model' },
    { key: 'quantity', label: 'Qty' },
    { key: 'amount', label: 'Amount' }
  ];

  tableActions: TableAction[] = [
    {
      label: 'Delete',
      action: (row: MiscellaneousBill) => this.deleteBill(row),
      variant: 'danger',
      icon: '<i class="bi bi-trash"></i>'
    }
  ];

  constructor() {
    this.headerForm = this.createHeaderForm();
    this.billForm = this.createBillForm();
    
    // Auto-save header to localStorage
    this.headerForm.valueChanges.subscribe(val => {
      if (!this.isViewMode) {
        localStorage.setItem('misc_voucher_header', JSON.stringify(val));
      }
    });

    // Handle Stock Item selection to toggle Model Number field and validation
    this.billForm.get('inventoryMasterId')?.valueChanges.subscribe(id => {
      this.selectedInventoryId.set(id ? +id : null);
      
      const modelControl = this.billForm.get('modelNumber');
      if (this.showModel()) {
        modelControl?.setValidators([Validators.required]);
      } else {
        modelControl?.clearValidators();
        if (!this.isViewMode) modelControl?.setValue('');
      }
      modelControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.queryParams['id'];
    const mode = this.route.snapshot.queryParams['mode'];
    const type = this.route.snapshot.queryParams['type']; // 'bill' or 'claim'

    if (id) {
      if (type === 'claim') {
        this.currentClaimId.set(+id);
        this.isViewMode = mode === 'view';
        this.isEditMode = mode === 'edit';
        this.loadClaimData(+id);
      } else {
        // Default to loading a bill
        this.isViewMode = mode === 'view';
        this.isEditMode = mode === 'edit';
        this.loadBillData(+id);
      }
    } else {
      this.loadHeaderFromStorage();
    }
  }

  private createHeaderForm(): FormGroup {
    return this.fb.group({
      forwardedToTreasury: ['no', Validators.required],
      subVoucherNo: ['', Validators.required],
      subVoucherDescription: ['', Validators.required],
      sanctionOrderNo: ['', Validators.required],
      sanctionOrderDate: ['', Validators.required],
      sanctionAuthority: ['', Validators.required],
      firmName: ['', Validators.required],
      tax: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private createBillForm(): FormGroup {
    return this.fb.group({
      billNumber: ['', Validators.required],
      billDate: ['', Validators.required],
      inventoryMasterId: ['', Validators.required],
      modelNumber: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      billAmount: [0, [Validators.required, Validators.min(1)]],
      miscellaneousBillId: [0]
    });
  }

  private loadHeaderFromStorage(): void {
    const saved = localStorage.getItem('misc_voucher_header');
    if (saved) {
      this.headerForm.patchValue(JSON.parse(saved));
    }
  }

  async loadClaimData(claimId: number) {
    this.isLoading.set(true);
    try {
      const details = await firstValueFrom(this.billingService.getClaimDetails(claimId));
      this.headerForm.patchValue({
        forwardedToTreasury: details.forwardedToTreasury ? 'yes' : 'no',
        subVoucherNo: details.subVoucherNo,
        subVoucherDescription: details.subVoucherDescription,
        sanctionOrderNo: details.sanctionOrderNo,
        sanctionOrderDate: details.sanctionOrderDate?.split('T')[0],
        sanctionAuthority: details.sanctionAuthority,
        firmName: details.firmName,
        tax: details.tax
      });

      if (this.isViewMode) this.headerForm.disable();
    } catch (error) {
      this.toastr.error('Failed to load voucher details');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadBillData(billId: number) {
    this.isLoading.set(true);
    try {
      const bill = await firstValueFrom(this.billingService.getMiscellaneousBillById(billId));
      this.billForm.patchValue({
        billNumber: bill.billNumber,
        billDate: bill.billDate?.split('T')[0],
        inventoryMasterId: bill.inventoryMasterId,
        modelNumber: bill.modelNumber,
        quantity: bill.quantity,
        billAmount: bill.amount,
        miscellaneousBillId: bill.miscellaneousBillId
      });

      // If bill is linked to a claim, load the claim header details
      if (bill.claimId) {
        await this.loadClaimData(bill.claimId);
      }

      if (this.isViewMode) {
        this.billForm.disable();
        this.headerForm.disable();
      }
    } catch (error) {
      this.toastr.error('Failed to load bill details');
    } finally {
      this.isLoading.set(false);
    }
  }

  async addBill() {
    if (this.billForm.invalid) {
      this.billForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    try {
      const payload = {
        ...this.billForm.value,
        amount: this.billForm.value.billAmount,
        status: 0 // Draft
      };

      await firstValueFrom(this.billingService.saveBill(BillType.Miscellaneous, payload));
      this.toastr.success('Bill added to draft');
      this.billForm.reset({ quantity: 1, billAmount: 0 });
      this.refreshBills$.next();
    } catch (error) {
      this.toastr.error('Failed to save bill');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteBill(bill: MiscellaneousBill) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This bill will be removed from your draft',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await firstValueFrom(this.billingService.deleteBill(BillType.Miscellaneous, bill.miscellaneousBillId));
        this.toastr.success('Bill deleted');
        this.refreshBills$.next();
      } catch (error) {
        this.toastr.error('Failed to delete bill');
      }
    }
  }

  async lockBills() {
    const bills = this.draftedBills() || [];
    if (bills.length === 0) {
      this.toastr.error('Please add at least one bill before locking');
      return;
    }

    if (this.headerForm.invalid) {
      this.headerForm.markAllAsTouched();
      this.toastr.error('Please complete all sanction details in Section 1');
      return;
    }

    const result = await Swal.fire({
      title: 'Lock & Submit?',
      text: 'You won\'t be able to edit these bills after locking!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, lock them!'
    });

    if (result.isConfirmed) {
      this.isLoading.set(true);
      try {
        const header = this.headerForm.value;
        const payload = {
          type: BillType.Miscellaneous,
          billIds: bills.map((b: MiscellaneousBill) => b.miscellaneousBillId),
          forwardedToTreasury: header.forwardedToTreasury === 'yes',
          subVoucherNo: header.subVoucherNo,
          subVoucherDescription: header.subVoucherDescription,
          sanctionOrderNo: header.sanctionOrderNo,
          sanctionOrderDate: header.sanctionOrderDate,
          sanctionAuthority: header.sanctionAuthority,
          firmName: header.firmName,
          tax: header.tax
        };

        await firstValueFrom(this.billingService.createClaim(payload));
        localStorage.removeItem('misc_voucher_header');
        this.toastr.success('Voucher locked and submitted successfully');
        this.router.navigate(['/miscellaneous-store-voucher']);
      } catch (error) {
        this.toastr.error('Failed to lock voucher');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  cancel() {
    this.router.navigate(['/miscellaneous-store-voucher']);
  }

  get totalAmount() {
    const bills = this.draftedBills() || [];
    return bills.reduce((sum: number, b: MiscellaneousBill) => sum + b.amount, 0);
  }
}

