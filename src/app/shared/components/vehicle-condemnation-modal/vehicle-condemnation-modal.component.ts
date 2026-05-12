import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { VehicleService } from '@shared/services/vehicle.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vehicle-condemnation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppButtonComponent, AppInputComponent],
  templateUrl: './vehicle-condemnation-modal.component.html',
  styleUrl: './vehicle-condemnation-modal.component.scss'
})
export class VehicleCondemnationModalComponent {
  @Input() vehicle: any;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private toastr = inject(ToastrService);

  condemnForm: FormGroup;
  isSubmitting = signal(false);
  disposalOrderFile: File | null = null;
  
  auctionStatusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Completed', value: 'Completed' }
  ];

  constructor() {
    this.condemnForm = this.fb.group({
      condemnationDate: [new Date().toISOString().split('T')[0], Validators.required],
      condemnationOrderNumber: ['', Validators.required],
      reason: ['', Validators.required],
      auctionStatus: ['Pending'],
      auctionDate: [null],
      auctionAmount: [null]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.disposalOrderFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.condemnForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    const formData = new FormData();
    const formValue = this.condemnForm.value;
    
    formData.append('vehicleId', this.vehicle.id.toString());
    formData.append('condemnationDate', formValue.condemnationDate);
    formData.append('condemnationOrderNumber', formValue.condemnationOrderNumber);
    formData.append('reason', formValue.reason);
    formData.append('auctionStatus', formValue.auctionStatus);
    
    if (formValue.auctionDate) {
      formData.append('auctionDate', formValue.auctionDate);
    }
    if (formValue.auctionAmount) {
      formData.append('auctionAmount', formValue.auctionAmount.toString());
    }
    if (this.disposalOrderFile) {
      formData.append('condemnationOrderFile', this.disposalOrderFile);
    }

    this.vehicleService.condemnVehicle(formData).subscribe({
      next: () => {
        this.toastr.success('Vehicle condemned successfully');
        this.isSubmitting.set(false);
        this.success.emit();
        this.onClose();
      },
      error: (err) => {
        this.toastr.error(err || 'Condemnation failed');
        this.isSubmitting.set(false);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
