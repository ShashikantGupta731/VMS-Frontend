import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UpdateVehicleDetailsService, VehicleSummary } from './update-vehicle-details.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';

@Component({
  selector: 'app-update-vehicle-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AppCardComponent,
    AppButtonComponent,
    AppInputComponent,
  ],
  templateUrl: './update-vehicle-details.html',
  styleUrls: ['./update-vehicle-details.scss']
})
export class UpdateVehicleDetailsComponent implements OnInit {
  searchForm!: FormGroup;
  vehicle: VehicleSummary | null = null;
  isLoading = false;
  hasSearched = false;

  private fb = inject(FormBuilder);
  private vehicleService = inject(UpdateVehicleDetailsService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      vehicleNumber: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) return;

    const searchTerm = this.searchForm.value.vehicleNumber.trim();
    this.isLoading = true;
    this.hasSearched = true;

    this.vehicleService.searchVehicle(searchTerm).subscribe({
      next: (data) => {
        this.vehicle = data;
        this.isLoading = false;
        if (!data) {
          this.toastr.warning('Vehicle not found.');
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle', err);
        this.toastr.error('Failed to search vehicle');
        this.isLoading = false;
        this.vehicle = null;
      }
    });
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.vehicle = null;
    this.hasSearched = false;
  }
}
