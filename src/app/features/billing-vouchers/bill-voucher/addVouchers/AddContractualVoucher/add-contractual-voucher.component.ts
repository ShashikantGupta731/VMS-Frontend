import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BillingService, BillType, ContractualBill } from '@shared/services/billing.service';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

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
  private toastr = inject(ToastrService);
  private billingService = inject(BillingService);

  voucherForm: FormGroup;
  isLoading = signal(false);

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
      billPeriodFrom: ['', Validators.required],
      billPeriodTo: ['', Validators.required],
      ddoCode: ['', Validators.required],
      vehicleNumber: ['', Validators.required],
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
      await firstValueFrom(this.billingService.saveBill(BillType.Contractual, this.voucherForm.value));
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
    if (confirm('Are you sure you want to delete this drafted bill?')) {
      await firstValueFrom(this.billingService.deleteBill(BillType.Contractual, voucher.id));
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
        type: 4, // Contractual
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
      this.toastr.success('Contractual claim created and submitted', 'Success');
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
      billPeriodFrom: '',
      billPeriodTo: '',
      vehicleNumber: '',
      amount: ''
    });
  }

  get totalBillAmount(): number {
    return (this.draftedBillsResource.value() ?? []).reduce((sum, b) => sum + b.amount, 0);
  }
}
