import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { AddOfficeService, OfficeFormData } from './add-office.service';
import { AuthService } from '@core/services/auth';
import { ToastrService } from 'ngx-toastr';
import { DropdownItem } from '@core/services/master';

@Component({
  selector: 'app-add-office',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AppCardComponent,
    AppButtonComponent,
    AppInputComponent,
  ],
  templateUrl: './add-office.component.html',
  styleUrl: './add-office.component.scss',
})
export class AddOfficeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private addOfficeService = inject(AddOfficeService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  officeForm!: FormGroup;
  departments: DropdownItem[] = [];
  districts: DropdownItem[] = [];
  tehsils: DropdownItem[] = [];
  officeTypes: DropdownItem[] = [];
  isLoading = false;
  isEditMode = false;
  officeId: number | null = null;

  // Configurable OfficeTypeId for "Other" — can be changed via API constant or config
  readonly OTHER_OFFICE_TYPE_ID = 5;

  ngOnInit(): void {
    this.initializeForm();
    this.loadDepartments();
    this.loadDistricts();
    this.loadTehsilsForUser();  // Load tehsils for user's district on init
    this.loadOfficeTypes();
    this.checkEditMode();
  }

  initializeForm(): void {
    this.officeForm = this.fb.group({
      department: [null, Validators.required],
      district: [null, Validators.required],
      tehsil: [null, Validators.required],
      officeName: ['', Validators.required],
      officeAddress: ['', Validators.required],
      officeAbbreviation: ['', Validators.required],
      officeType: [null, Validators.required],
      officeTypeOther: [''],
    });
  }

  loadDepartments(): void {
    this.addOfficeService.getDepartments().subscribe({
      next: (data) => { this.departments = data; },
      error: () => this.toastr.error('Failed to load departments')
    });
  }

  loadDistricts(): void {
    this.addOfficeService.getDistricts().subscribe({
      next: (data) => { this.districts = data; },
      error: () => this.toastr.error('Failed to load districts')
    });
  }

  /** Load tehsils for user's own district (legacy behavior) */
  loadTehsilsForUser(): void {
    this.addOfficeService.getTehsils().subscribe({
      next: (data) => { this.tehsils = data; },
      error: () => this.toastr.error('Failed to load tehsils')
    });
  }

  loadOfficeTypes(): void {
    this.addOfficeService.getOfficeTypes().subscribe({
      next: (data) => { this.officeTypes = data; },
      error: () => this.toastr.error('Failed to load office types')
    });
  }

  onDistrictChange(): void {
    const districtId = this.officeForm.get('district')?.value;
    if (districtId) {
      this.addOfficeService.getTehsils(districtId).subscribe({
        next: (data) => { this.tehsils = data; },
        error: () => this.toastr.error('Failed to load tehsils')
      });
      // Reset tehsil selection when district changes
      this.officeForm.patchValue({ tehsil: null });
    } else {
      // If no district selected, reload tehsils for user's own district
      this.loadTehsilsForUser();
      this.officeForm.patchValue({ tehsil: null });
    }
  }

  /** Show/hide "Other Office Type" field based on configurable office type ID */
  get showOtherOfficeType(): boolean {
    const selectedType = this.officeForm.get('officeType')?.value;
    return selectedType === this.OTHER_OFFICE_TYPE_ID;
  }

  checkEditMode(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.officeId = Number(idParam);
      this.isEditMode = true;
      this.loadOfficeForEdit(this.officeId);
    }
    // Also support legacy query param approach
    const queryId = this.route.snapshot.queryParamMap.get('id');
    if (!this.isEditMode && queryId) {
      this.officeId = Number(queryId);
      this.isEditMode = true;
      this.loadOfficeForEdit(this.officeId);
    }
  }

  private loadOfficeForEdit(id: number): void {
    this.isLoading = true;
    this.addOfficeService.getOfficeById(id).subscribe({
      next: (office) => {
        // First load districts and tehsils for the edit
        this.loadDistricts();

        this.officeForm.patchValue({
          department: office.deptId,
          officeName: office.officeName,
          officeAddress: office.officeAddress,
          officeAbbreviation: office.officeAbbreviation,
          officeType: office.officeTypeId,
          officeTypeOther: office.officeTypeOther || '',
        });

        // Load tehsils if district is available
        if (office.districtId) {
          this.addOfficeService.getTehsils(office.districtId).subscribe({
            next: (tehsils) => {
              this.tehsils = tehsils;
              this.officeForm.patchValue({
                district: office.districtId,
                tehsil: office.tehsilId,
              });
            }
          });
        }

        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load office details');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    // Form validation
    if (this.officeForm.invalid) {
      this.markFormGroupTouched(this.officeForm);
      this.toastr.error('Please fill all required fields correctly', 'Validation Error');
      return;
    }

    // Additional validation for "Other Office Type"
    const officeTypeId = this.officeForm.get('officeType')?.value;
    const officeTypeOther = this.officeForm.get('officeTypeOther')?.value;
    if (officeTypeId === this.OTHER_OFFICE_TYPE_ID && !officeTypeOther?.trim()) {
      this.toastr.error('Please provide office type details', 'Validation Error');
      return;
    }

    this.isLoading = true;
    const userId = this.authService.currentUserValue?.id?.toString() || '';

    const formData: OfficeFormData = {
      deptId: this.officeForm.get('department')?.value,
      districtId: this.officeForm.get('district')?.value,
      tehsilId: this.officeForm.get('tehsil')?.value,
      officeName: this.officeForm.get('officeName')?.value,
      officeAddress: this.officeForm.get('officeAddress')?.value,
      officeAbbreviation: this.officeForm.get('officeAbbreviation')?.value,
      officeTypeId: officeTypeId,
      officeTypeOther: officeTypeId === this.OTHER_OFFICE_TYPE_ID ? officeTypeOther : '',
    };

    if (this.isEditMode && this.officeId !== null) {
      this.addOfficeService.updateOffice(this.officeId, formData).subscribe({
        next: () => {
          this.toastr.success('Office updated successfully', 'Success');
          this.isLoading = false;
          this.navigateToOffices();
        },
        error: () => {
          this.toastr.error('Failed to update office', 'Error');
          this.isLoading = false;
        },
      });
    } else {
      this.addOfficeService.saveOffice(formData, userId).subscribe({
        next: () => {
          this.toastr.success('Office saved successfully', 'Success');
          this.isLoading = false;
          this.navigateToOffices();
        },
        error: () => {
          this.toastr.error('Failed to save office', 'Error');
          this.isLoading = false;
        },
      });
    }
  }

  onBack(): void {
    this.navigateToOffices();
  }

  navigateToOffices(): void {
    this.router.navigate(['/master/office']);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters for template access
  get department() { return this.officeForm.get('department'); }
  get district() { return this.officeForm.get('district'); }
  get tehsil() { return this.officeForm.get('tehsil'); }
  get officeName() { return this.officeForm.get('officeName'); }
  get officeAddress() { return this.officeForm.get('officeAddress'); }
  get officeAbbreviation() { return this.officeForm.get('officeAbbreviation'); }
  get officeType() { return this.officeForm.get('officeType'); }
  get officeTypeOther() { return this.officeForm.get('officeTypeOther'); }

  get departmentOptions() {
    return this.departments.map(d => ({ label: d.name, value: d.id }));
  }
  get districtOptions() {
    return this.districts.map(d => ({ label: d.name, value: d.id }));
  }
  get tehsilOptions() {
    return this.tehsils.map(d => ({ label: d.name, value: d.id }));
  }
  get officeTypeOptions() {
    return this.officeTypes.map(d => ({ label: d.name, value: d.id }));
  }
}
