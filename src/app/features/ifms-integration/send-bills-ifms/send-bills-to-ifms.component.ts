import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SendBillsService, Bill } from '../send-bills-ifms/send-bills.service';
import { IfmsBillProcessStateService } from '../send-bills-ifms-process/ifms-bill-process-state.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { AuthService } from '@core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-send-bills-to-ifms',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppCardComponent,
    AppButtonComponent,
    AppDataTableComponent,
    AppInputComponent
  ],
  providers: [SendBillsService],
  templateUrl: './send-bills-to-ifms.component.html',
  styleUrl: './send-bills-to-ifms.component.scss',
})
export class SendBillsToIfmsComponent implements OnInit {
  // Services
  private sendBillsService = inject(SendBillsService);
  private authService = inject(AuthService);
  private processStateService = inject(IfmsBillProcessStateService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // States
  bills: Bill[] = [];
  selectedBills: Bill[] = [];
  isLoading = false;
  selectAll = false;
  showPage1 = true;
  showPage2 = false;

  // Form groups
  budgetForm!: FormGroup;
  btForm!: FormGroup;
  ecsForm!: FormGroup;
  ddForm!: FormGroup;
  dcbillForm!: FormGroup;

  // Dropdowns & lists
  month = new Date().getMonth() + 1;
  billType = 10; // Default Fully Contingent Form 10
  isDemandDraft = 'false';

  monthArray = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  billTypeArray = [
    { value: 10, label: 'Fully Contingent Bill (Form 10)' },
    { value: 6, label: 'Abstract Contingent Bill (Form 6)' }
  ];

  // Saved sub-tables arrays
  btDetailsArray: any[] = [];
  ecsDetailsArray: any[] = [];
  ddDetailsArray: any[] = [];

  // Masters arrays
  BTArray: any[] = [];
  BTArrayCopy: any[] = [];
  ECSPayeeArray: any[] = [];
  ECSPayeeArrayCopy: any[] = [];
  ddoGrantHead: any[] = [];
  ddoGrantHeadCopy: any[] = [];

  // Search modals toggle flags
  showDdoGrantFlag = false;
  showPayeeFlag = false;

  // DDO states
  schemeCode: string = '';      // captured from DDO Grant Head selection
  isDDPaymentDisabled = false;  // set from API payee response
  billTypeLocked = false;       // locked after budget head is fetched

  // Budget query parameters
  modalFund = '1';
  modalClassOfExp = '1';
  modalBudgetType = '1';
  searchMajorHead = '';
  searchMinorHead = '';

  // Payee search text
  payeeSearchText = '';

  // Selected masters rows
  selectedGrantRow: any = null;

  // Table columns for Page 1
  tableColumns: TableColumn[] = [
    { key: 'claimNumber', label: 'Claim Number', sortable: true },
    { 
      key: 'amount', 
      label: 'Amount', 
      sortable: true,
      render: (val: number) => `<strong>₹ ${val.toLocaleString('en-IN')}</strong>`
    },
    { 
      key: 'subVoucherNo', 
      label: 'Sub Voucher No. / Sanction Order No.', 
      allowHtml: true,
      render: (val: any, row: any) => `
        <div class="fw-medium text-dark">${row.subVoucherNo || ''}</div>
        <div class="text-muted small">${row.sanctionOrderNo || ''}</div>
      `
    },
    { 
      key: 'sanctionAuthority', 
      label: 'Sanction Authority / Sanction Order Date', 
      allowHtml: true,
      render: (val: any, row: any) => {
        const formatDate = (dateStr: string) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return dateStr;
          const day = String(date.getDate()).padStart(2, '0');
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };
        return `
          <div class="fw-medium text-dark">${row.sanctionAuthority || ''}</div>
          <div class="text-muted small">${formatDate(row.sanctionOrderDate)}</div>
        `;
      }
    },
    { key: 'claimFor', label: 'Claim For', sortable: true },
    { 
      key: 'postDate', 
      label: 'Post Date', 
      sortable: true,
      render: (val: string) => {
        if (!val) return '';
        const date = new Date(val);
        if (isNaN(date.getTime())) return val;
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    },
  ];

  tableActions: TableAction[] = [
    {
      label: (row: Bill) => row.selected ? 'Discard' : 'Select',
      icon: (row: Bill) => row.selected ? '<i class="pi pi-times"></i>' : '<i class="pi pi-check"></i>',
      variant: (row: Bill) => row.selected ? 'danger' : 'default',
      action: (row: Bill) => this.toggleBillSelection(row),
      disabled: (row: Bill) => this.isBillDisabled(row),
    },
  ];

  ngOnInit(): void {
    this.createForms();
    this.loadBills();
    this.loadPayees();
    this.loadBTDetails();
  }

  getDdoCode(): string {
    // Use the IFMS-specific DDO code (e.g. CHD00/0135), NOT the login username
    // Backend JwtService embeds this as claim 'ddoCode' from User.DDOCode
    return this.authService.currentUserValue?.ddoCode
        || this.authService.currentUserValue?.username
        || '';
  }

  // Loaders
  loadBills(): void {
    this.isLoading = true;
    this.sendBillsService.getBills().subscribe({
      next: (data: Bill[]) => {
        this.bills = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading bills:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadPayees(): void {
    const ddoCode = this.getDdoCode();
    this.sendBillsService.getPayees(ddoCode).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          const parsed = JSON.parse(res.data);
          // Check if DD payments are disabled for this DDO by Treasury
          if (res.disableddpayments) {
            this.isDDPaymentDisabled = true;
          }
          this.ECSPayeeArray = parsed.data || [];
          this.ECSPayeeArrayCopy = [...this.ECSPayeeArray];
        }
      }
    });
  }

  loadBTDetails(): void {
    this.sendBillsService.getBTDetails().subscribe({
      next: (res) => {
        if (res && res.success && res.result) {
          this.BTArray = res.result.filter((el: any) => el.description === 'IT');
          this.BTArrayCopy = [...this.BTArray];
        }
      }
    });
  }

  createForms(): void {
    const alphanumericPattern = '^[a-zA-Z0-9. /]*$';
    const onlyNumberPattern = '^[0-9]*$';

    this.budgetForm = this.fb.group({
      budget_demand: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      budget_majorhead: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      budget_submajorhead: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      budget_minorhead: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      budget_subhead: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      budget_detailedhead: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      budget_soecode: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      budget_subsoecode: ['00', [Validators.required, Validators.pattern(alphanumericPattern)]],
      budget_sharecode: ['1', [Validators.pattern(alphanumericPattern)]],
      budget_recurcode: ['1', [Validators.pattern(alphanumericPattern)]],
      budget_deptcode: ['29', [Validators.pattern(alphanumericPattern)]],
      budget_ddowalletid: ['', [Validators.pattern(alphanumericPattern)]],
      gross_amount: ['', [Validators.required, Validators.pattern(onlyNumberPattern)]]
    });

    this.btForm = this.fb.group({
      btCode: [''],
      mjrHead: ['', [Validators.pattern(alphanumericPattern)]],
      subMjrHead: ['', [Validators.pattern(alphanumericPattern)]],
      minrHead: ['', [Validators.pattern(alphanumericPattern)]],
      sbHead: ['', [Validators.pattern(alphanumericPattern)]],
      dtlHead: ['', [Validators.pattern(alphanumericPattern)]],
      amount: ['', [Validators.pattern(onlyNumberPattern)]],
      btId: ['', [Validators.pattern(alphanumericPattern)]]
    });

    this.ecsForm = this.fb.group({
      partyname: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      payeename: [''],
      ifsccode: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      bankname: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      accountno: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      paymentdetails: ['', [Validators.pattern(alphanumericPattern)]],
      contactno: ['', [Validators.required, Validators.pattern(alphanumericPattern)]],
      panno: ['', [Validators.pattern(alphanumericPattern)]],
      address: ['', [Validators.required]],
      payment_amount: ['', [Validators.required, Validators.pattern(onlyNumberPattern)]],
      payment_type: ['NEFT'],
      chalanValidityDate: [''],
      gstNumber: [''],
      gstFirmName: ['']
    });

    this.ddForm = this.fb.group({
      ddname: [''],
      partyname: [''],
      payment_amount: ['', [Validators.pattern(onlyNumberPattern)]]
    });

    this.dcbillForm = this.fb.group({
      vch_no: ['', [Validators.pattern(onlyNumberPattern)]],
      vch_dt: ['']
    });
  }

  // Row selection helpers
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.bills.forEach((bill) => {
      if (bill.amount > 0) {
        bill.selected = this.selectAll;
      }
    });
    this.updateSelectedBills();
  }

  toggleSelectAllFromTable(selectAll: boolean): void {
    this.selectAll = selectAll;
    this.bills.forEach((bill) => {
      if (bill.amount > 0) {
        bill.selected = selectAll;
      }
    });
    this.updateSelectedBills();
  }

  onRowSelect(event: { row: Bill; selected: boolean }): void {
    event.row.selected = event.selected;
    this.updateSelectedBills();
    this.updateSelectAllState();
  }

  isRowSelected = (row: Bill): boolean => {
    return row.selected || false;
  };

  isRowDisabled = (row: Bill): boolean => {
    return this.isBillDisabled(row);
  };

  toggleBillSelection(bill: Bill): void {
    if (bill.amount > 0) {
      bill.selected = !bill.selected;
      this.updateSelectedBills();
      this.updateSelectAllState();
    }
  }

  updateSelectedBills(): void {
    this.selectedBills = this.bills.filter((bill) => bill.selected);
  }

  updateSelectAllState(): void {
    const eligibleBills = this.bills.filter((bill) => bill.amount > 0);
    const selectedEligibleBills = eligibleBills.filter((bill) => bill.selected);
    this.selectAll = selectedEligibleBills.length === eligibleBills.length && eligibleBills.length > 0;
  }

  isBillDisabled(bill: Bill): boolean {
    return bill.amount === 0;
  }

  // Financial calculations
  get totalAmount(): number {
    return this.selectedBills.reduce((sum, bill) => sum + bill.amount, 0);
  }

  get totalIncomeTaxAmountSelected(): number {
    return this.selectedBills.reduce((sum, bill) => sum + (bill.incomeTaxAmount || 0), 0);
  }

  get totalPayableAmount(): number {
    return this.totalAmount - this.totalIncomeTaxAmountSelected;
  }

  get totalTax(): number {
    return this.selectedBills.reduce((sum, bill) => sum + (bill.amount * 0.18), 0);
  }

  get grossAmount(): number {
    const bt = this.btDetailsArray.reduce((sum, x) => sum + (+x.amount || 0), 0);
    const ecs = this.ecsDetailsArray.reduce((sum, x) => sum + (+x.payment_amount || 0), 0);
    const dd = this.ddDetailsArray.reduce((sum, x) => sum + (+x.payment_amount || 0), 0);
    return bt + ecs + dd;
  }

  get netAmount(): number {
    const ecs = this.ecsDetailsArray.reduce((sum, x) => sum + (+x.payment_amount || 0), 0);
    const dd = this.ddDetailsArray.reduce((sum, x) => sum + (+x.payment_amount || 0), 0);
    return ecs + dd;
  }

  get totalIncomeTaxAmountEntered(): number {
    return this.btDetailsArray
      .filter((x) => x.btCode === 'IT')
      .reduce((sum, x) => sum + (+x.amount || 0), 0);
  }

  // Matching check getters
  get isGrossMatch(): boolean {
    return this.totalAmount === this.grossAmount;
  }

  get isITMatch(): boolean {
    return this.totalIncomeTaxAmountSelected === this.totalIncomeTaxAmountEntered;
  }

  get isNetMatch(): boolean {
    return this.totalPayableAmount === this.netAmount;
  }

  get isFormValid(): boolean {
    if (!this.month || !this.billType) return false;
    if (this.budgetForm?.invalid) return false;
    if (this.ecsDetailsArray.length === 0) return false;
    if (!this.isGrossMatch) return false;
    if (!this.isITMatch) return false;
    if (!this.isNetMatch) return false;
    if (+this.billType === 6 && this.dcbillForm?.invalid) return false;
    return true;
  }

  // Page routing
  processSelectedBills(): void {
    if (this.selectedBills.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select at least 1 bill before proceeding!',
      });
      return;
    }
    this.processStateService.setSelectedBills(this.selectedBills);
    this.router.navigate(['/bill-integration/process-selected-bills']);
  }

  turnToPage(pageNo: number): void {
    if (pageNo === 1) {
      this.showPage1 = true;
      this.showPage2 = false;

      // Reset all Page 2 state so stale entries don't persist across selection changes
      this.btDetailsArray = [];
      this.ecsDetailsArray = [];
      this.ddDetailsArray = [];
      this.selectedGrantRow = null;
      this.schemeCode = '';
      this.billTypeLocked = false;
      this.budgetForm.reset({
        budget_subsoecode: '00',
        budget_sharecode: '1',
        budget_recurcode: '1',
        budget_deptcode: '29'
      });
      this.btForm.reset();
      this.ecsForm.reset({ payment_type: 'NEFT' });
    } else {
      this.showPage1 = false;
      this.showPage2 = true;

      // Auto-set gross amount in budget form
      this.budgetForm.patchValue({ gross_amount: this.totalAmount });
      
      // Auto-populate Income Tax into BT form amount if it is greater than zero
      if (this.totalIncomeTaxAmountSelected > 0) {
        this.btForm.patchValue({
          btCode: 'IT',
          amount: this.totalIncomeTaxAmountSelected
        });
        this.onBTCodeChange('IT');
      }
    }
  }

  // Book Transfer (BT) actions
  onBTCodeChange(btCode: string): void {
    const match = this.BTArrayCopy.find((x) => x.description === btCode);
    if (match) {
      this.btForm.patchValue({
        mjrHead: match.major_code,
        subMjrHead: match.sub_major_code,
        minrHead: match.minor_code,
        sbHead: match.sub_head_code,
        dtlHead: match.detail_head_code,
        btId: match.btcode
      });
    }
  }

  addBTDetail(): void {
    if (this.btForm.invalid) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please fill complete Book Transfer details.' });
      return;
    }
    const val = this.btForm.value;
    if (+val.amount <= 0) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Amount must be greater than zero.' });
      return;
    }

    this.btDetailsArray.push({ ...val });
    this.btForm.reset();
    this.cdr.detectChanges();
  }

  removeBTDetail(index: number): void {
    this.btDetailsArray.splice(index, 1);
  }

  // Payees ECS actions
  openPayeeSearch(): void {
    this.payeeSearchText = '';
    this.ECSPayeeArray = [...this.ECSPayeeArrayCopy];
    this.showPayeeFlag = true;
  }

  searchPayees(): void {
    const text = this.payeeSearchText.toLowerCase();
    this.ECSPayeeArray = this.ECSPayeeArrayCopy.filter((p) => {
      return (
        p.payeeName.toLowerCase().includes(text) ||
        p.accountNo.includes(text) ||
        p.payeeCode.toString().includes(text)
      );
    });
  }

  selectPayee(payee: any): void {
    const isGST = payee.ifscCode === 'RBIS0GSTPMT';
    if (isGST) {
      this.ecsForm.get('chalanValidityDate')?.setValidators([Validators.required]);
    } else {
      this.ecsForm.get('chalanValidityDate')?.clearValidators();
      this.ecsForm.get('chalanValidityDate')?.setValue('');
    }
    this.ecsForm.get('chalanValidityDate')?.updateValueAndValidity();

    this.ecsForm.patchValue({
      partyname: payee.payeeCode,
      payeename: payee.payeeName,
      ifsccode: payee.ifscCode,
      bankname: payee.bankName,
      accountno: payee.accountNo,
      email: payee.email,
      contactno: payee.mobileNo,
      panno: payee.pan,
      address: payee.address,
      payment_amount: this.totalPayableAmount - this.netAmount > 0 ? this.totalPayableAmount - this.netAmount : 0
    });

    this.showPayeeFlag = false;
  }

  addECSDetail(): void {
    if (this.ecsForm.invalid) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please fill complete ECS Payee details.' });
      return;
    }
    const val = this.ecsForm.value;
    if (+val.payment_amount <= 0) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Amount must be greater than zero.' });
      return;
    }

    // Check duplicate
    if (this.ecsDetailsArray.some((x) => x.partyname === val.partyname)) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Payee is already added to the list. Remove and re-add if you wish to adjust the amount.' });
      return;
    }

    this.ecsDetailsArray.push({ ...val });
    this.ecsForm.reset({ payment_type: 'NEFT' });
    this.cdr.detectChanges();
  }

  removeECSDetail(index: number): void {
    this.ecsDetailsArray.splice(index, 1);
  }

  // DD actions
  addDDDetail(): void {
    if (this.ddForm.invalid) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please fill Demand Draft details.' });
      return;
    }
    const val = this.ddForm.value;
    if (+val.payment_amount <= 0) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Amount must be greater than zero.' });
      return;
    }

    this.ddDetailsArray.push({ ...val });
    this.ddForm.reset();
    this.cdr.detectChanges();
  }

  removeDDDetail(index: number): void {
    this.ddDetailsArray.splice(index, 1);
  }

  // Budget Grant Head search actions
  openGrantSearch(): void {
    this.ddoGrantHead = [];
    this.selectedGrantRow = null;
    this.showDdoGrantFlag = true;
  }

  fetchGrantHeads(): void {
    const ddoCode = this.getDdoCode();
    const classExpCode = this.modalClassOfExp === '1' ? 'V' : 'C';
    this.sendBillsService.getBudgetHeads(ddoCode, classExpCode, +this.modalBudgetType).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          const parsed = JSON.parse(res.data);
          this.ddoGrantHead = parsed.data || [];
          this.ddoGrantHeadCopy = [...this.ddoGrantHead];
          this.cdr.detectChanges();
        }
      }
    });
  }

  fetchGrants(): void {
    this.fetchGrantHeads();
  }

  selectGrantRow(row: any): void {
    this.selectedGrantRow = row;
  }

  confirmGrantHead(): void {
    if (!this.selectedGrantRow) {
      Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please select a Grant Head.' });
      return;
    }
    // Capture scheme_code - required in IFMS submission payload
    this.schemeCode = this.selectedGrantRow.scheme_code || '';

    this.budgetForm.patchValue({
      budget_demand: this.selectedGrantRow.demand,
      budget_majorhead: this.selectedGrantRow.majorHead,
      budget_submajorhead: this.selectedGrantRow.subMajorHead,
      budget_minorhead: this.selectedGrantRow.minorHead,
      budget_subhead: this.selectedGrantRow.subHead,
      budget_detailedhead: this.selectedGrantRow.detailHead,
      budget_soecode: this.selectedGrantRow.soe,
      budget_ddowalletid: this.selectedGrantRow.ddoWalletId,
      budget_sharecode: this.selectedGrantRow.share_code,
      budget_recurcode: this.selectedGrantRow.recur_code,
      budget_deptcode: this.selectedGrantRow.dept_code
    });
    // Lock bill type after budget head selection to prevent state corruption
    this.billTypeLocked = true;
    this.showDdoGrantFlag = false;
  }

  // Main Submit
  onSubmit(): void {
    if (!this.month || !this.billType) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please select Bill Month and Bill Type.' });
      return;
    }
    if (this.budgetForm.invalid) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please fill complete Budget Head allocation details.' });
      return;
    }
    if (this.ecsDetailsArray.length === 0) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'At least one ECS Payee payment is compulsory.' });
      return;
    }

    // --- VALIDATION 1: IT Amounts must match ---
    if (!this.isITMatch) {
      Swal.fire({ icon: 'error', title: 'Income Tax Mismatch',
        html: `Income Tax in Book Transfer (<strong>₹${this.totalIncomeTaxAmountEntered.toLocaleString('en-IN')}</strong>) must equal selected bills IT total (<strong>₹${this.totalIncomeTaxAmountSelected.toLocaleString('en-IN')}</strong>).` });
      return;
    }

    // --- VALIDATION 2: Gross must match Total Bills amount ---
    if (!this.isGrossMatch) {
      Swal.fire({ icon: 'error', title: 'Gross Amount Mismatch',
        html: `Gross entered in allocations (<strong>₹${this.grossAmount.toLocaleString('en-IN')}</strong>) must equal total selected bill amount (<strong>₹${this.totalAmount.toLocaleString('en-IN')}</strong>).` });
      return;
    }

    // --- VALIDATION 3: Net payable must match ECS + DD total ---
    const ecsDdTotal = this.ecsDetailsArray.reduce((s: number, x: any) => s + (+x.payment_amount || 0), 0)
                     + this.ddDetailsArray.reduce((s: number, x: any) => s + (+x.payment_amount || 0), 0);
    if (this.totalPayableAmount !== ecsDdTotal) {
      Swal.fire({ icon: 'error', title: 'Net Payable Mismatch',
        html: `Net Payable amount (<strong>₹${this.totalPayableAmount.toLocaleString('en-IN')}</strong>) must equal total ECS + DD disbursals (<strong>₹${ecsDdTotal.toLocaleString('en-IN')}</strong>).` });
      return;
    }

    // --- VALIDATION 4: Net = gross - BT (the 4th check legacy had) ---
    if (!this.isNetMatch) {
      Swal.fire({ icon: 'error', title: 'Net Amount Error',
        html: `Net Amount (<strong>₹${this.netAmount.toLocaleString('en-IN')}</strong>) must equal selected bills Net Payable (<strong>₹${this.totalPayableAmount.toLocaleString('en-IN')}</strong>).` });
      return;
    }

    // Build the post payload matching InVmsPostBill viewmodel
    const postData = {
      form: {
        integration_src: 'VMS',
        bill_no: 0,
        ddo_code: this.getDdoCode(),          // Fix 3: reads DDO code from JWT, not login username
        bill_month: +this.month,               // Fix 1: user-selected month, NOT hardcoded current month
        sub_soe: this.budgetForm.value.budget_subsoecode,
        hoa_id: +this.budgetForm.value.budget_ddowalletid || 0,
        bill_code: +this.billType,             // Fix 2: user-selected bill type, NOT hardcoded 10
        scheme_code: this.schemeCode,          // Fix 4: captured from grant head selection
        gross_amount: this.totalAmount,
        net_amount: this.netAmount,
        tobt: this.btDetailsArray.map((bt) => ({
          btCode: bt.btCode,
          mjrHead: bt.mjrHead,
          subMjrHead: bt.subMjrHead,
          minrHead: bt.minrHead,
          sbHead: bt.sbHead,
          dtlHead: bt.dtlHead,
          amount: +bt.amount,
          btId: +bt.btId || 0
        })),
        agbt: [],
        payee_detail: this.ecsDetailsArray.map((ecs) => ({
          hc: ecs.partyname,
          amt: +ecs.payment_amount,
          gstDt: ecs.chalanValidityDate ? new Date(ecs.chalanValidityDate).toISOString().split('T')[0] : '',
          mhc: '',
          gstNo: ecs.gstNumber || '',
          entNm: ecs.gstFirmName || ''
        })),
        form_data_1: this.selectedBills.map((b) => ({
          vno: b.subVoucherNo || '',
          vdes: b.claimFor || '',
          expdet: b.sanctionAuthority || '',
          snorno: b.sanctionOrderNo || '',
          snordt: b.sanctionOrderDate ? new Date(b.sanctionOrderDate).toISOString().split('T')[0] : '',
          snauth: b.sanctionAuthority || '',
          snamt: b.amount,
          it: b.incomeTaxAmount || 0,
          nbal: b.amount - (b.incomeTaxAmount || 0)
        })),
        form_data_2: [],
        form_data_3: [],
        dept_ref_no: 0,
        nps_data: []
      },
      billsToProcessArray: this.selectedBills.map((b) => ({
        fuelMaintenanceIFMSId: b.fuelMaintenanceIFMSId || 0,
        fuelMaintenance: b.fuelMaintenance || 0,
        actionDate: new Date().toISOString(),
        amount: b.amount,
        subVoucherNo: b.subVoucherNo || '',
        subVoucherDesc: b.claimFor || '',
        expenditureDetails: b.sanctionAuthority || '',
        sanctionOrderNo: b.sanctionOrderNo || '',
        sanctionOrderDate: b.sanctionOrderDate || new Date().toISOString(),
        sanctionAuthority: b.sanctionAuthority || '',
        fwdToTreasury: true,
        status: 'Submitted to IFMS',
        claimNo: b.claimNumber || '',
        ddoCode: this.getDdoCode(),
        modulePK: b.fuelMaintenanceIFMSId || 0,
        billType: b.fuelMaintenance || 0,
        moduleId: b.fuelMaintenance || 0,
        sentBy: this.authService.currentUserValue?.name || '',
        sentById: this.authService.currentUserValue?.id || 0,
        applicantCode: 0,
        applicantName: this.authService.currentUserValue?.name || '',
        applicantDesig: 'DDO Officer',
        applicantOffice: 'VMS DDO Office',
        pDate: new Date().toISOString(),
        tDate: new Date().toISOString(),
        claimResponseId: '',
        incomeTaxAmount: b.incomeTaxAmount || 0
      }))
    };

    Swal.fire({
      title: 'Confirm Submission',
      html: '<div class="text-danger fw-bold">Warning: Once submitted to eTreasury (IFMS), you cannot modify or revert the bills. Please double-check details!</div>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm and Send',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.cdr.detectChanges();

        this.sendBillsService.sendBillsToIfms(postData).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.cdr.detectChanges();
            if (res && res.success) {
              const parsed = JSON.parse(res.data);
              const billNo = parsed.data?.billNo || 'N/A';
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                html: `Successfully submitted to IFMS.<br>Note down your Bill Number for tracking:<br><h4 class="text-primary mt-2"><strong>${billNo}</strong></h4>`,
                confirmButtonText: 'OK'
              }).then(() => {
                this.router.navigate(['/ifms-claims']);
              });
            } else {
              // Fix 5: Parse structured IFMS error response (array of {error_code, error_desc})
              let errorMsg = 'An unknown error occurred during Treasury submission.';
              if (Array.isArray(res.msg) && res.msg[0]?.error_desc) {
                errorMsg = res.msg[0].error_desc;
              } else if (typeof res.msg === 'string') {
                try {
                  const parsedErr = JSON.parse(res.msg);
                  errorMsg = parsedErr?.Error?.[0]?.error_desc || res.msg;
                } catch { errorMsg = res.msg; }
              }
              Swal.fire({ icon: 'error', title: 'Submission Failed', text: errorMsg });
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.cdr.detectChanges();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err?.error?.msg || 'Failed to submit bills to treasury.'
            });
          }
        });
      }
    });
  }
}
