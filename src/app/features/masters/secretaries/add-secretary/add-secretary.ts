import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { SecretaryService, CreateSecretaryDto, UpdateSecretaryDto } from '@shared/services/secretary.service';
import { MasterService, Department } from '@core/services/master';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-secretary',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AppCardComponent,
    AppButtonComponent,
    AppInputComponent,
  ],
  templateUrl: './add-secretary.html',
})
export class AddSecretaryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private secretaryService = inject(SecretaryService);
  private masterService = inject(MasterService);
  private toastr = inject(ToastrService);

  secretaryForm!: FormGroup;
  departments: Department[] = [];
  isLoading = false;
  isEditMode = false;
  secretaryId: number | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.loadDepartments();
    this.checkEditMode();
  }

  initializeForm(): void {
    this.secretaryForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      emailId: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      department: [null, Validators.required],
      isActive: [true, Validators.required]
    });
  }

  loadDepartments(): void {
    this.masterService.getDepartments().subscribe({
      next: (data) => { this.departments = data; },
      error: () => this.toastr.error('Failed to load departments')
    });
  }

  checkEditMode(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.secretaryId = Number(idParam);
      this.isEditMode = true;
      this.loadSecretaryForEdit(this.secretaryId);
    }
  }

  loadSecretaryForEdit(id: number): void {
    this.isLoading = true;
    this.secretaryService.getSecretaryById(id).subscribe({
      next: (secretary) => {
        this.secretaryForm.patchValue({
          title: secretary.title,
          emailId: secretary.emailId,
          department: secretary.deptId,
          isActive: secretary.isActive
        });
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load secretary details');
        this.isLoading = false;
        this.onBack();
      }
    });
  }

  onSubmit(): void {
    if (this.secretaryForm.invalid) {
      this.secretaryForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields correctly', 'Validation Error');
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.secretaryId !== null) {
      const formData: UpdateSecretaryDto = {
        title: this.secretaryForm.get('title')?.value,
        emailId: this.secretaryForm.get('emailId')?.value,
        deptId: Number(this.secretaryForm.get('department')?.value),
        isActive: this.secretaryForm.get('isActive')?.value === 'true' || this.secretaryForm.get('isActive')?.value === true
      };

      this.secretaryService.updateSecretary(this.secretaryId, formData).subscribe({
        next: () => {
          this.toastr.success('Secretary updated successfully', 'Success');
          this.isLoading = false;
          this.navigateToSecretaries();
        },
        error: () => {
          this.toastr.error('Failed to update secretary', 'Error');
          this.isLoading = false;
        },
      });
    } else {
      const formData: CreateSecretaryDto = {
        title: this.secretaryForm.get('title')?.value,
        emailId: this.secretaryForm.get('emailId')?.value,
        deptId: Number(this.secretaryForm.get('department')?.value),
        isActive: this.secretaryForm.get('isActive')?.value === 'true' || this.secretaryForm.get('isActive')?.value === true
      };

      this.secretaryService.createSecretary(formData).subscribe({
        next: () => {
          this.toastr.success('Secretary saved successfully', 'Success');
          this.isLoading = false;
          this.navigateToSecretaries();
        },
        error: () => {
          this.toastr.error('Failed to save secretary', 'Error');
          this.isLoading = false;
        },
      });
    }
  }

  onBack(): void {
    this.navigateToSecretaries();
  }

  navigateToSecretaries(): void {
    this.router.navigate(['/master/secretaries']);
  }

  get departmentOptions() {
    return this.departments.map(d => ({ label: d.deptName, value: d.deptId }));
  }
}
