import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { ToastrService } from 'ngx-toastr';
import { VehicleService } from '@shared/services/vehicle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-driver-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AppCardComponent,
    AppButtonComponent,
    AppInputComponent,
  ],
  templateUrl: './edit-driver-details.component.html',
  styleUrls: ['./edit-driver-details.component.scss']
})
export class EditDriverDetailsComponent implements OnInit {
  form!: FormGroup;
  vehicleInfoId: number = 0;
  isPermanent: boolean = false;
  isCondemnedStatus: boolean = false;
  todayDate: Date = new Date();

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehicleService = inject(VehicleService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.createForm();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.vehicleInfoId = +idParam;
      this.loadVehicleData();
    }
  }

  createForm() {
    this.form = this.fb.group({
      vehiclenumber: ['', [Validators.required, Validators.maxLength(15)]],
      RegistrationType: [true, Validators.required],
      currentstatus: ['', Validators.required],
      UpdatedDate: [''],
      drivername: ['', [Validators.required, Validators.maxLength(30)]],
      drivertype: ['', Validators.required],
      drivercontact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });

    this.form.get('currentstatus')?.valueChanges.subscribe(val => {
      this.isCondemnedStatus = val === 'Condemned';
      if (this.isCondemnedStatus) {
        this.form.get('UpdatedDate')?.setValidators([Validators.required]);
      } else {
        this.form.get('UpdatedDate')?.clearValidators();
      }
      this.form.get('UpdatedDate')?.updateValueAndValidity();
    });
  }

  loadVehicleData() {
    const payload = {
      vehicleEntryId: this.vehicleInfoId,
      dateFrom: new Date(),
      dateTo: new Date(),
    };

    this.vehicleService.getVehicleEntry(payload).subscribe({
      next: (data: any) => {
        if (data && data.id) {
          this.isPermanent = !data.isTemporaryRegistration;

          this.form.patchValue({
            vehiclenumber: data.registrationNumber,
            RegistrationType: this.isPermanent,
            currentstatus: data.currentStatus,
            drivername: data.driverName,
            drivertype: data.driverType,
            drivercontact: data.driverContactNumber,
          });

          if (this.isPermanent) {
            this.form.get('vehiclenumber')?.disable();
            this.form.get('RegistrationType')?.disable();
          }
        } else {
          this.toastr.error('Unable to fetch vehicle record.');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load vehicle data.');
      }
    });
  }

  onUpdate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      VehicleInfoId: this.vehicleInfoId,
      DriverName: this.form.get('drivername')?.value,
      DriverContact: this.form.get('drivercontact')?.value,
      Status: this.form.get('currentstatus')?.value,
      VehicleNumber: this.form.getRawValue().vehiclenumber,
      DriverType: this.form.get('drivertype')?.value,
      RegistrationType: this.form.getRawValue().RegistrationType,
      UpdatedDate: this.form.get('UpdatedDate')?.value || new Date(),
      Attachments: JSON.stringify({
        vehicleno: '',
        chassisno: null,
        engineno: null,
        registrationcert: '',
      }),
    };

    this.vehicleService.updateDriverInfo(payload).subscribe({
      next: (res: any) => {
        if (res && res.message) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Information updated successfully',
          }).then(() => {
            this.router.navigate(['/vehicle']);
          });
        } else {
          this.toastr.error('Unable to update the record.');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error updating vehicle information.');
      }
    });
  }
}
