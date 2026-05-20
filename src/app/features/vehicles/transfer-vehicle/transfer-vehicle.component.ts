import { Component, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { MasterService, Office, Department, Designation, Officer } from '@core/services/master';
import { VehicleService } from '@shared/services/vehicle.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-transfer-vehicle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    AppButtonComponent,
    AppInputComponent,
    InputTextModule
  ],
  templateUrl: './transfer-vehicle.component.html',
  styleUrl: './transfer-vehicle.component.scss'
})
export class TransferVehicleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private masterService = inject(MasterService);
  private vehicleService = inject(VehicleService);
  private cdr = inject(ChangeDetectorRef);

  vehicleId: number | null = null;
  vehicle: any = null;
  transferForm!: FormGroup;

  // Signals
  isSubmitting = signal(false);
  isVerifyingHrms = signal(false);

  // Dropdown Lists
  departments: Department[] = [];
  departmentOptions: { label: string; value: number }[] = [];

  allOffices: Office[] = [];
  officeOptions: { label: string; value: number }[] = [];

  allDesignations: Designation[] = [];
  designationOptions: { label: string; value: number }[] = [];

  allOfficers: Officer[] = [];
  officerOptions: { label: string; value: number }[] = [];

  allocationTypeOptions = [
    { label: 'EARMARKED', value: 'EARMARKED' },
    { label: 'POOL', value: 'POOL' },
    { label: 'CONTRACTUAL EARMARKED', value: 'CONTRACTUAL EARMARKED' },
    { label: 'CONTRACTUAL POOLED', value: 'CONTRACTUAL POOLED' },
    { label: 'REQUISITION EARMARKED', value: 'REQUISITION EARMARKED' },
    { label: 'REQUISITION POOLED', value: 'REQUISITION POOLED' },
    { label: 'PROJECT EARMARKED', value: 'PROJECT EARMARKED' },
    { label: 'PROJECT POOLED', value: 'PROJECT POOLED' }
  ];

  // HRMS Verification State
  verifiedOfficerName = '';

  // Search Modal State
  showSearchModal = false;
  searchQuery = '';
  filteredOffices: Office[] = [];
  filteredOfficesCopy: Office[] = [];



  ngOnInit(): void {
    this.initForm();
    this.loadRouteParams();
    this.loadMasterData();
    this.setupFormSubscribers();
  }

  private initForm(): void {
    this.transferForm = this.fb.group({
      transferDate: [new Date().toISOString().split('T')[0], Validators.required],
      toDeptId: ['', Validators.required],
      toOfficeId: ['', Validators.required],
      toAllocationType: ['', Validators.required],
      toDesignationId: [''],
      toOfficerId: [''],
      toHRMSCode: [''],
      toOfficerName: [''],
      transferOrderNumber: ['TFR-' + Math.floor(100000 + Math.random() * 900000), Validators.required],
      remarks: ['']
    });
  }

  private loadRouteParams(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.vehicleId = +params['id'];
        this.loadVehicleDetails(this.vehicleId);
      } else {
        this.toastr.error('No vehicle ID provided');
        this.router.navigate(['/vehicle']);
      }
    });
  }

  private loadVehicleDetails(id: number): void {
    this.vehicleService.getVehicleById(id).subscribe({
      next: (data) => {
        this.vehicle = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Failed to load vehicle details');
        this.router.navigate(['/vehicle']);
      }
    });
  }

  private loadMasterData(): void {
    // 1. Departments
    this.masterService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.departmentOptions = data.map(d => ({ label: d.deptName, value: d.deptId }));
        this.cdr.detectChanges();
      }
    });

    // 2. All Offices (for general selection/lookup)
    this.masterService.getOffices().subscribe({
      next: (data) => {
        this.allOffices = data;
        this.filteredOffices = data;
        this.officeOptions = data.map(o => ({ label: o.officeName, value: o.id }));
        this.cdr.detectChanges();
      }
    });

    // 3. Officers list
    this.masterService.getOfficers().subscribe({
      next: (data) => {
        this.allOfficers = data;
        this.officerOptions = data.map(o => ({ label: o.officerName, value: o.id }));
        this.cdr.detectChanges();
      }
    });
  }

  private setupFormSubscribers(): void {
    // A. Department change -> Fetches target offices and designations from API for that specific department
    this.transferForm.get('toDeptId')?.valueChanges.subscribe(deptId => {
      this.transferForm.patchValue({ toOfficeId: '' }, { emitEvent: false });
      this.transferForm.patchValue({ toDesignationId: '' }, { emitEvent: false });
      if (deptId) {
        // 1. Fetch Offices
        this.masterService.getOffices(+deptId).subscribe({
          next: (data) => {
            this.filteredOffices = data;
            this.filteredOfficesCopy = data;
            this.officeOptions = data.map(o => ({ label: o.officeName, value: o.id }));
            this.cdr.detectChanges();
          },
          error: () => {
            this.filteredOffices = [];
            this.filteredOfficesCopy = [];
            this.officeOptions = [];
            this.cdr.detectChanges();
          }
        });

        // 2. Fetch Designations
        this.masterService.getDesignations(undefined, +deptId).subscribe({
          next: (data) => {
            this.allDesignations = data;
            this.designationOptions = data.map(d => ({ label: d.designationName, value: d.designationId }));
            this.cdr.detectChanges();
          },
          error: () => {
            this.allDesignations = [];
            this.designationOptions = [];
            this.cdr.detectChanges();
          }
        });
      } else {
        this.filteredOffices = [];
        this.filteredOfficesCopy = [];
        this.officeOptions = [];
        this.allDesignations = [];
        this.designationOptions = [];
        this.cdr.detectChanges();
      }
    });

    // B. Target Office change -> Clear designation selection
    this.transferForm.get('toOfficeId')?.valueChanges.subscribe(officeId => {
      this.transferForm.patchValue({ toDesignationId: '' }, { emitEvent: false });
    });

    // C. Allocation Type change -> dynamic validation rules
    this.transferForm.get('toAllocationType')?.valueChanges.subscribe(type => {
      const isEarmarked = type && type.includes('EARMARKED');
      const designationCtrl = this.transferForm.get('toDesignationId');
      const officerCtrl = this.transferForm.get('toOfficerId');
      const hrmsCtrl = this.transferForm.get('toHRMSCode');

      if (isEarmarked) {
        designationCtrl?.setValidators([Validators.required]);
      } else {
        designationCtrl?.clearValidators();
        officerCtrl?.clearValidators();
        hrmsCtrl?.clearValidators();

        this.transferForm.patchValue({
          toDesignationId: '',
          toOfficerId: '',
          toHRMSCode: '',
          toOfficerName: ''
        }, { emitEvent: false });
        this.verifiedOfficerName = '';
      }

      designationCtrl?.updateValueAndValidity();
      officerCtrl?.updateValueAndValidity();
      hrmsCtrl?.updateValueAndValidity();
    });

    // D. Designation change -> Dynamic input validation for Employee vs political/other officer role
    this.transferForm.get('toDesignationId')?.valueChanges.subscribe(desigId => {
      const officerCtrl = this.transferForm.get('toOfficerId');
      const hrmsCtrl = this.transferForm.get('toHRMSCode');

      this.transferForm.patchValue({ toOfficerId: '', toHRMSCode: '', toOfficerName: '' }, { emitEvent: false });
      this.verifiedOfficerName = '';

      if (desigId) {
        const designation = this.allDesignations.find(d => d.designationId === +desigId);
        const isEmp = designation?.designationType === 'Employee' || designation?.designationType === '1';

        if (isEmp) {
          hrmsCtrl?.setValidators([Validators.required]);
          officerCtrl?.clearValidators();
        } else {
          officerCtrl?.setValidators([Validators.required]);
          hrmsCtrl?.clearValidators();
          // Filter officer options by Designation if available
          const filteredOfficers = this.allOfficers.filter(o => o.designationId === +desigId);
          this.officerOptions = filteredOfficers.map(o => ({ label: o.officerName, value: o.id }));
          if (this.officerOptions.length === 0) {
            // fallback to all officers
            this.officerOptions = this.allOfficers.map(o => ({ label: o.officerName, value: o.id }));
          }
        }
      } else {
        officerCtrl?.clearValidators();
        hrmsCtrl?.clearValidators();
      }

      officerCtrl?.updateValueAndValidity();
      hrmsCtrl?.updateValueAndValidity();
    });

    // E. Officer Selection change -> Auto set Officer Name
    this.transferForm.get('toOfficerId')?.valueChanges.subscribe(officerId => {
      if (officerId) {
        const officer = this.allOfficers.find(o => o.id === +officerId);
        if (officer) {
          this.transferForm.patchValue({ toOfficerName: officer.officerName }, { emitEvent: false });
        }
      }
    });
  }

  isEarmarked(): boolean {
    const type = this.transferForm.get('toAllocationType')?.value;
    return type && type.includes('EARMARKED');
  }

  isEmployeeDesignation(): boolean {
    const desigId = this.transferForm.get('toDesignationId')?.value;
    if (!desigId) return false;
    const designation = this.allDesignations.find(d => d.designationId === +desigId);
    return designation?.designationType === 'Employee' || designation?.designationType === '1';
  }

  designationSelected(): boolean {
    return !!this.transferForm.get('toDesignationId')?.value;
  }

  verifyHrms(): void {
    const hrmsCode = this.transferForm.get('toHRMSCode')?.value;
    if (!hrmsCode) {
      this.toastr.warning('Please enter HRMS Code first', 'Warning');
      return;
    }

    this.isVerifyingHrms.set(true);
    this.masterService.verifyHrms(hrmsCode).subscribe({
      next: (data) => {
        this.isVerifyingHrms.set(false);
        if (data) {
          this.toastr.success('Officer details verified!', 'Success');
          this.verifiedOfficerName = data.name;
          this.transferForm.patchValue({ toOfficerName: data.name });
        } else {
          this.toastr.error('Officer details not found in HRMS', 'Not Found');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isVerifyingHrms.set(false);
        this.toastr.error('Officer not found or HRMS service offline', 'Error');
        this.cdr.detectChanges();
      }
    });
  }


  openSearchModal(): void {
    this.searchQuery = '';
    const deptId = this.transferForm.get('toDeptId')?.value;
    if (deptId) {
      // Use the department-filtered offices we already loaded
      this.showSearchModal = true;
    } else {
      // If no department selected, load all offices
      this.masterService.getOffices().subscribe({
        next: (data) => {
          this.filteredOffices = data;
          this.filteredOfficesCopy = data;
          this.showSearchModal = true;
          this.cdr.detectChanges();
        }
      });
    }
  }

  closeSearchModal(): void {
    this.showSearchModal = false;
  }

  onSearchInput(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredOffices = this.filteredOfficesCopy.filter(o =>
        o.officeName.toLowerCase().includes(query) ||
        (o.userId && o.userId.toLowerCase().includes(query))
      );
    } else {
      this.filteredOffices = this.filteredOfficesCopy;
    }
    this.cdr.detectChanges();
  }

  selectOffice(officeId: number): void {
    const office = this.filteredOffices.find(o => o.id === officeId) || this.filteredOfficesCopy.find(o => o.id === officeId);
    if (office) {
      // Auto patch department if not set
      if (!this.transferForm.get('toDeptId')?.value) {
        this.transferForm.patchValue({ toDeptId: office.deptId });
      }
      
      // We must make sure the department offices and designations are loaded if not already
      const currentDeptId = this.transferForm.get('toDeptId')?.value;
      if (currentDeptId && +currentDeptId !== office.deptId) {
        this.transferForm.patchValue({ toDeptId: office.deptId }, { emitEvent: false });
        
        // Load Offices
        this.masterService.getOffices(office.deptId).subscribe({
          next: (data) => {
            this.filteredOffices = data;
            this.filteredOfficesCopy = data;
            this.officeOptions = data.map(o => ({ label: o.officeName, value: o.id }));
            this.transferForm.patchValue({ toOfficeId: office.id });
            this.cdr.detectChanges();
          }
        });

        // Load Designations
        this.masterService.getDesignations(undefined, office.deptId).subscribe({
          next: (data) => {
            this.allDesignations = data;
            this.designationOptions = data.map(d => ({ label: d.designationName, value: d.designationId }));
            this.cdr.detectChanges();
          }
        });
      } else {
        this.transferForm.patchValue({ toOfficeId: office.id });
      }
      
      this.toastr.success(`Selected Office: ${office.officeName}`);
      this.closeSearchModal();
    }
  }

  onSubmit(): void {
    if (this.transferForm.invalid) {
      this.toastr.error('Please fill all required fields correctly', 'Validation Error');
      return;
    }

    this.isSubmitting.set(true);
    const formData = new FormData();
    formData.append('vehicleId', this.vehicleId!.toString());
    formData.append('toOfficeId', this.transferForm.get('toOfficeId')?.value);
    formData.append('transferDate', this.transferForm.get('transferDate')?.value);
    formData.append('transferOrderNumber', this.transferForm.get('transferOrderNumber')?.value);
    formData.append('remarks', this.transferForm.get('remarks')?.value || '');

    // Allocation Details
    formData.append('toDeptId', this.transferForm.get('toDeptId')?.value);
    formData.append('toAllocationType', this.transferForm.get('toAllocationType')?.value);
    formData.append('toDesignationId', this.transferForm.get('toDesignationId')?.value || '');
    formData.append('toOfficerId', this.transferForm.get('toOfficerId')?.value || '');
    formData.append('toHRMSCode', this.transferForm.get('toHRMSCode')?.value || '');
    formData.append('toOfficerName', this.transferForm.get('toOfficerName')?.value || '');



    this.vehicleService.transferVehicle(formData).subscribe({
      next: () => {
        this.toastr.success('Vehicle transferred successfully!', 'Success');
        this.isSubmitting.set(false);
        this.router.navigate(['/vehicle']);
      },
      error: (err) => {
        this.toastr.error(err || 'Failed to transfer vehicle', 'Error');
        this.isSubmitting.set(false);
      }
    });
  }
}
