import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { VehicleService } from '@shared/services/vehicle.service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-mark-condemned',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppCardComponent, AppButtonComponent, AppInputComponent],
  templateUrl: './mark-condemned.html',
  styleUrls: ['./mark-condemned.scss']
})
export class MarkCondemnedComponent implements OnInit {
  replacementForm: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  markedVehicles: any[] = [];
  condemnedVehicleOptions: { label: string; value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private router: Router
  ) {
    this.replacementForm = this.fb.group({
      newVehicleRegNo: ['', Validators.required],
      newVehicleChassisNo: [{ value: '', disabled: true }],
      condemnedVehicleRegNo: ['', Validators.required],
      condemnedVehicleChassisNo: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    this.loadMarkedVehicles();
  }

  loadMarkedVehicles() {
    this.vehicleService.getVehicles().subscribe({
      next: (res: any[]) => {
        this.markedVehicles = res.filter((v: any) => v.currentStatus === 'CONDEMNED' || v.currentStatus === 'Marked for Condemned by FD');
        this.condemnedVehicleOptions = this.markedVehicles.map(v => ({
          label: v.registrationNumber,
          value: v.registrationNumber
        }));
      },
      error: () => {
        Swal.fire('Error', 'Failed to load condemned vehicles', 'error');
      }
    });
  }

  onCondemnedVehicleChange() {
    const regNo = this.replacementForm.get('condemnedVehicleRegNo')?.value;
    const vehicle = this.markedVehicles.find(v => v.registrationNumber === regNo);
    if (vehicle) {
      this.replacementForm.patchValue({
        condemnedVehicleChassisNo: vehicle.chassisNumber || 'N/A'
      });
    } else {
      this.replacementForm.patchValue({
        condemnedVehicleChassisNo: ''
      });
    }
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.replacementForm.invalid) {
      this.replacementForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const rawValue = this.replacementForm.getRawValue();
    Object.keys(rawValue).forEach(key => {
      if (rawValue[key] !== null && rawValue[key] !== undefined) {
        formData.append(key, rawValue[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('fdApprovalDoc', this.selectedFile);
    }

    this.isLoading = true;
    this.vehicleService.registerReplacementVehicle(formData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('Success', 'Vehicle replacement details submitted successfully!', 'success').then(() => {
          this.router.navigate(['/vehicle']);
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        Swal.fire('Error', err.error?.message || 'Failed to submit details', 'error');
      }
    });
  }

  goBack() {
    this.router.navigate(['/vehicle']);
  }
}
