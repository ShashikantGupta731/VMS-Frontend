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
  selector: 'app-condemned-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppCardComponent, AppButtonComponent, AppInputComponent],
  templateUrl: './condemned-deposit.html',
  styleUrls: ['./condemned-deposit.scss']
})
export class CondemnedDepositComponent implements OnInit {
  grnForm: FormGroup;
  markedVehicles: any[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private router: Router
  ) {
    this.grnForm = this.fb.group({
      oldVehicleNumber: ['', Validators.required],
      condemnedChassisNo: [{ value: '', disabled: true }],
      newVehicleRegNo: [{ value: '', disabled: true }],
      newVehicleChassisNo: [{ value: '', disabled: true }],
      isOldGrn: [false],
      grnNumber: ['', Validators.required],
      grnDate: [''],
      grnBillAmount: ['', [Validators.required, Validators.min(0)]],
      amountForSelectedVehicle: ['', [Validators.required, Validators.min(0)]],
      haveYouEnteredAllGRNsFullAmount: [false]
    });
  }

  ngOnInit() {
    this.loadMarkedVehicles();
  }

  loadMarkedVehicles() {
    this.vehicleService.getVehicles().subscribe({
      next: (res: any[]) => {
        this.markedVehicles = res.filter((v: any) => v.currentStatus === 'CONDEMNED' || v.currentStatus === 'Marked for Condemned by FD');
      },
      error: () => {
        Swal.fire('Error', 'Failed to load vehicles', 'error');
      }
    });
  }

  onCondemnedVehicleChange() {
    const regNo = this.grnForm.get('oldVehicleNumber')?.value;
    const vehicle = this.markedVehicles.find(v => v.registrationNumber === regNo);
    if (vehicle) {
      this.grnForm.patchValue({
        condemnedChassisNo: vehicle.chassisNumber || 'N/A',
        newVehicleRegNo: vehicle.replacementVehicleRegNo || 'N/A',
        newVehicleChassisNo: vehicle.replacementVehicleChassisNo || 'N/A',
      });
    } else {
      this.grnForm.patchValue({
        condemnedChassisNo: '',
        newVehicleRegNo: '',
        newVehicleChassisNo: '',
      });
    }
  }

  onSubmit() {
    if (this.grnForm.invalid) {
      this.grnForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const rawValue = this.grnForm.getRawValue();
    Object.keys(rawValue).forEach(key => {
      if (rawValue[key] !== null && rawValue[key] !== undefined) {
        formData.append(key, rawValue[key]);
      }
    });

    this.isLoading = true;
    this.vehicleService.addGrnDetails(formData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('Success', 'Amount deposited details submitted successfully!', 'success').then(() => {
          this.router.navigate(['/vehicles/condemned/mark-condemned']);
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        Swal.fire('Error', err.error?.message || 'Failed to submit details', 'error');
      }
    });
  }

  goBack() {
    this.router.navigate(['/vehicles/condemned/mark-condemned']);
  }
}
