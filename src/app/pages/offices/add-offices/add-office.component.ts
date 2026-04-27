import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppCardComponent } from '../../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../../shared/components/ui/app-button/button.component';
import { AddOfficeService, OfficePayload } from './add-office.service';

@Component({
  selector: 'app-add-office',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AppCardComponent,
    AppButtonComponent,
  ],
  templateUrl: './add-office.component.html',
  styleUrl: './add-office.component.scss',
})
export class AddOfficeComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private addOfficeService: AddOfficeService
  ) {}

  officeForm!: FormGroup;
  departments: { label: string; value: string }[] = [];
  tehsils: { label: string; value: string }[] = [];
  officeTypes: { label: string; value: string }[] = [];
  isLoading = false;
  isEditMode = false;
  officeId: number | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.loadDropdownData();
    this.checkEditMode();
  }

  initializeForm(): void {
    this.officeForm = this.fb.group({
      department: ['', Validators.required],
      tehsil: [''],
      officeName: ['', Validators.required],
      officeAddress: [''],
      officeAbbreviation: [''],
      officeType: ['', Validators.required],
    });
  }

  loadDropdownData(): void {
    this.addOfficeService.getDepartments().subscribe((data) => {
      this.departments = data;
    });

    this.addOfficeService.getTehsils().subscribe((data) => {
      this.tehsils = data;
    });

    this.addOfficeService.getOfficeTypes().subscribe((data) => {
      this.officeTypes = data;
    });
  }

  checkEditMode(): void {
    // Check if we're in edit mode based on route params
    // For now, default to add mode
    this.isEditMode = false;
  }

  onSubmit(): void {
    if (this.officeForm.invalid) {
      this.markFormGroupTouched(this.officeForm);
      return;
    }

    this.isLoading = true;
    const officeData: OfficePayload = this.officeForm.value;

    if (this.isEditMode && this.officeId !== null) {
      this.addOfficeService.updateOffice(this.officeId, officeData).subscribe({
        next: (response) => {
          console.log('Office updated successfully:', response);
          this.isLoading = false;
          this.navigateToOffices();
        },
        error: (error: any) => {
          console.error('Error updating office:', error);
          this.isLoading = false;
        },
      });
    } else {
      this.addOfficeService.saveOffice(officeData).subscribe({
        next: (response) => {
          console.log('Office saved successfully:', response);
          this.isLoading = false;
          this.navigateToOffices();
        },
        error: (error: any) => {
          console.error('Error saving office:', error);
          this.isLoading = false;
        },
      });
    }
  }

  onBack(): void {
    this.navigateToOffices();
  }

  onGoBackToHome(): void {
    this.router.navigate(['/dashboard']);
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

  get department() {
    return this.officeForm.get('department');
  }

  get officeName() {
    return this.officeForm.get('officeName');
  }

  get officeType() {
    return this.officeForm.get('officeType');
  }
}
