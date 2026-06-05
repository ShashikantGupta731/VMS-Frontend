import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PetrolPumpService, StockAmountDto } from '../../../core/services/petrol-pump.service';
import { AppInputComponent } from '../../../shared/components/ui/app-input/input.component';
import { AppButtonComponent } from '../../../shared/components/ui/app-button/button.component';
import { AppCardComponent } from '../../../shared/components/ui/app-card/card.component';
import Swal from 'sweetalert2';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-fill-fuel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, AppInputComponent, AppButtonComponent, AppCardComponent],
  templateUrl: './add-fill-fuel.component.html'
})
export class AddFillFuelComponent implements OnInit {
  private fb = inject(FormBuilder);
  private petrolPumpService = inject(PetrolPumpService);
  private router = inject(Router);

  form!: FormGroup;
  stockAmounts: StockAmountDto | null = null;
  isSubmitting = false;

  inventoryOptions = [
    { value: 'Petrol', label: 'Petrol' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Mobil Oil', label: 'Mobil Oil' },
    { value: 'Engine Oil', label: 'Engine Oil' },
    { value: 'Gear Oil', label: 'Gear Oil' },
    { value: 'Break Oil', label: 'Break Oil' }
  ];

  ngOnInit(): void {
    this.createForm();
    this.fetchStock();
  }

  createForm(): void {
    this.form = this.fb.group({
      vehicleNumber: ['', [Validators.required]],
      ddoCode: ['PPO-DEFAULT', [Validators.required]],
      inventoryType: ['', [Validators.required]],
      litres: [null, [Validators.required, Validators.min(0.1)]],
      amount: [null, [Validators.required, Validators.min(1)]],
      dateOfAllowance: ['', [Validators.required]]
    });

    // Auto-calculate amount or validate limits when inventory/litres change
    this.form.get('inventoryType')?.valueChanges.subscribe(val => {
      this.validateStockLimits();
    });

    this.form.get('litres')?.valueChanges.subscribe(val => {
      this.validateStockLimits();
    });
  }

  fetchStock(): void {
    this.petrolPumpService.getStockAmounts().subscribe(res => {
      if (res.success && res.result) {
        this.stockAmounts = res.result;
      }
    });
  }

  validateStockLimits(): void {
    if (!this.stockAmounts) return;

    const type = this.form.get('inventoryType')?.value;
    const litres = this.form.get('litres')?.value;

    if (!type || !litres) return;

    let available = 0;
    switch (type) {
      case 'Petrol': available = this.stockAmounts.petrol; break;
      case 'Diesel': available = this.stockAmounts.diesel; break;
      case 'Mobil Oil': available = this.stockAmounts.mobilOil; break;
      case 'Engine Oil': available = this.stockAmounts.engineOil; break;
      case 'Gear Oil': available = this.stockAmounts.gearOil; break;
      case 'Break Oil': available = this.stockAmounts.breakOil; break;
    }

    if (litres > available) {
      this.form.get('litres')?.setErrors({ exceedsStock: true });
    } else {
      const currentErrors = this.form.get('litres')?.errors;
      if (currentErrors) {
        delete currentErrors['exceedsStock'];
        this.form.get('litres')?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
      }
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required') && control.touched) return 'This field is required.';
    if (control?.hasError('exceedsStock')) return 'Entered litres exceeds available stock!';
    if (control?.hasError('min')) return 'Must be greater than 0.';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const val = this.form.value;

    const request = {
      ddoCode: val.ddoCode,
      vehicleNumber: val.vehicleNumber,
      inventory: val.inventoryType,
      litres: val.litres,
      amount: val.amount,
      dateAllowance: val.dateOfAllowance
    };

    this.petrolPumpService.insertFuelEntry(request).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          Swal.fire({
            title: 'Information Updated Successfully!',
            text: res.msg || 'Fuel entry logged successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/ppo']);
          });
        } else {
          Swal.fire('Error', res.msg || 'Unable to save entry', 'error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire('Error', 'Server error occurred', 'error');
      }
    });
  }

  // --- Vehicle Search Modal Logic ---
  showModal = false;
  searchQuery = '';
  vehicleList: any[] = [];
  isSearching = false;

  openModal(): void {
    this.showModal = true;
    this.searchQuery = '';
    this.vehicleList = [];
  }

  closeModal(): void {
    this.showModal = false;
  }

  searchVehicles(): void {
    if (!this.searchQuery.trim()) return;
    this.isSearching = true;
    this.petrolPumpService.searchVehicles(this.searchQuery).subscribe({
      next: (res) => {
        this.isSearching = false;
        if (res.success && res.result) {
          this.vehicleList = res.result;
        }
      },
      error: () => {
        this.isSearching = false;
      }
    });
  }

  selectVehicle(vehicle: any): void {
    this.form.patchValue({
      vehicleNumber: vehicle.vehicleNumber,
      ddoCode: vehicle.ddoCode || 'PPO-DEFAULT'
    });
    this.closeModal();
  }
}
