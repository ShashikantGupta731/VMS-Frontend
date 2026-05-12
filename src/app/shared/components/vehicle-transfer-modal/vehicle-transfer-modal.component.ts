import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { MasterService } from '@core/services/master';
import { VehicleService } from '@shared/services/vehicle.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vehicle-transfer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppButtonComponent, AppInputComponent],
  templateUrl: './vehicle-transfer-modal.component.html',
  styleUrl: './vehicle-transfer-modal.component.scss'
})
export class VehicleTransferModalComponent implements OnInit {
  @Input() vehicle: any;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private masterService = inject(MasterService);
  private vehicleService = inject(VehicleService);
  private toastr = inject(ToastrService);

  transferForm: FormGroup;
  isSubmitting = signal(false);
  isLoadingOffices = signal(false);
  officeOptions: { label: string; value: number }[] = [];
  transferOrderFile: File | null = null;

  constructor() {
    this.transferForm = this.fb.group({
      toOfficeId: ['', Validators.required],
      transferDate: [new Date().toISOString().split('T')[0], Validators.required],
      transferOrderNumber: ['', Validators.required],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadOffices();
  }

  private loadOffices(): void {
    this.isLoadingOffices.set(true);
    this.masterService.getOffices().subscribe({
      next: (offices) => {
        // Filter out current office
        this.officeOptions = offices
          .filter(o => o.id !== this.vehicle?.officeId)
          .map(o => ({ label: o.officeName, value: o.id }));
        this.isLoadingOffices.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load offices');
        this.isLoadingOffices.set(false);
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.transferOrderFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.transferForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    const formData = new FormData();
    formData.append('vehicleId', this.vehicle.id.toString());
    formData.append('toOfficeId', this.transferForm.get('toOfficeId')?.value);
    formData.append('transferDate', this.transferForm.get('transferDate')?.value);
    formData.append('transferOrderNumber', this.transferForm.get('transferOrderNumber')?.value);
    formData.append('remarks', this.transferForm.get('remarks')?.value);
    
    if (this.transferOrderFile) {
      formData.append('transferOrderFile', this.transferOrderFile);
    }

    this.vehicleService.transferVehicle(formData).subscribe({
      next: () => {
        this.toastr.success('Vehicle transferred successfully');
        this.isSubmitting.set(false);
        this.success.emit();
        this.onClose();
      },
      error: (err) => {
        this.toastr.error(err || 'Transfer failed');
        this.isSubmitting.set(false);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
