import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { MasterService, Office, Designation } from '@core/services/master';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-officer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AppCardComponent,
    AppButtonComponent,
    AppInputComponent
  ],
  templateUrl: './add-officer.component.html',
  styleUrl: './add-officer.component.scss',
})
export class AddOfficerComponent implements OnInit {
  officerForm!: FormGroup;
  isLoading = signal(false);
  isVerifying = signal(false);
  isEditMode = signal(false);
  officerId: number | null = null;

  offices: { label: string; value: number }[] = [];
  designations: { label: string; value: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private masterService: MasterService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadDropdownData();
    this.checkEditMode();
  }

  initializeForm(): void {
    this.officerForm = this.fb.group({
      officerId: ['', Validators.required],
      officerName: ['', Validators.required],
      hrmsCode: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      deptId: [0, Validators.required],
      designationId: [0, Validators.required],
      designationType: [1, Validators.required],
      fuelLimit: [0, [Validators.required, Validators.min(0)]],
      fuelLimmitd: [0, [Validators.required, Validators.min(0)]],
      maintenanceLimit: [0, [Validators.required, Validators.min(0)]],
      maintenanceLimitd: [0, [Validators.required, Validators.min(0)]],
      remarks: [''],
      fileName: [''],
      updatedBy: ['System'],
      tDate: [null],
      enabled: [true]
    });
  }

  loadDropdownData(): void {
    this.masterService.getOffices().subscribe((data) => {
      this.offices = data.map(o => ({ label: o.officeName, value: o.id }));
    });

    this.masterService.getDesignations().subscribe((data) => {
      this.designations = data.map(d => ({ label: d.designationName, value: d.designationId }));
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.officerId = +id;
      this.loadOfficerData(this.officerId);
    }
  }

  loadOfficerData(id: number): void {
    this.isLoading.set(true);
    this.masterService.getOfficer(id).subscribe({
      next: (officer) => {
        this.officerForm.patchValue(officer);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Error loading officer data');
        this.isLoading.set(false);
        this.router.navigate(['/master/officer']);
      }
    });
  }

  verifyHrms(): void {
    const code = this.officerForm.get('hrmsCode')?.value;
    if (!code) {
      this.toastr.warning('Please enter HRMS code first');
      return;
    }

    this.isVerifying.set(true);
    this.masterService.verifyHrms(code).subscribe({
      next: (res) => {
        if (res.status === 200 && res.empdetails && res.empdetails.length > 0) {
          const emp = res.empdetails[0];
          // Use employee name as officer name
          this.officerForm.patchValue({
            officerId: emp.empcd,
            officerName: emp.empname,
            hrmsCode: emp.empcd,
          });
          this.toastr.success('HRMS Data fetched successfully');
        } else {
          this.toastr.error('No employee found with this HRMS code');
        }
        this.isVerifying.set(false);
      },
      error: () => {
        this.toastr.error('Error verifying HRMS code');
        this.isVerifying.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.officerForm.invalid) {
      this.officerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const officerData = this.officerForm.value;

    if (this.isEditMode() && this.officerId !== null) {
      this.masterService.updateOfficer(this.officerId, officerData).subscribe({
        next: () => {
          this.toastr.success('Officer updated successfully');
          this.router.navigate(['/master/officer']);
        },
        error: () => {
          this.toastr.error('Error updating officer');
          this.isLoading.set(false);
        }
      });
    } else {
      this.masterService.saveOfficer(officerData).subscribe({
        next: () => {
          this.toastr.success('Officer added successfully');
          this.router.navigate(['/master/officer']);
        },
        error: () => {
          this.toastr.error('Error adding officer');
          this.isLoading.set(false);
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/master/officer']);
  }
}
