import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { VehicleService } from '@shared/services/vehicle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fd-approval',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppCardComponent, AppButtonComponent, AppInputComponent],
  templateUrl: './fd-approval.html',
  styleUrls: ['./fd-approval.scss']
})
export class FdApprovalComponent implements OnInit {
  searchForm: FormGroup;
  vehicles: any[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService
  ) {
    this.searchForm = this.fb.group({
      ddoCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSearch() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const ddoCode = this.searchForm.get('ddoCode')?.value;
    this.isLoading = true;
    
    this.vehicleService.getVehiclesByDdo(ddoCode).subscribe({
      next: (res: any[]) => {
        this.isLoading = false;
        // Filter out vehicles that are already condemned/sold/marked
        this.vehicles = res.filter(v => !['Condemned', 'Sold', 'Marked for Condemned by FD'].includes(v.currentStatus));
        if (this.vehicles.length === 0) {
          Swal.fire('Info', 'No eligible vehicles found for this DDO code.', 'info');
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to fetch vehicles', 'error');
      }
    });
  }

  markForCondemned(vehicleNumber: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to mark vehicle ${vehicleNumber} for condemnation.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, mark it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.vehicleService.markForCondemned({ vehicleNumber }).subscribe({
          next: () => {
            this.isLoading = false;
            Swal.fire('Success', 'Vehicle marked for condemned successfully.', 'success');
            // Refresh list
            this.onSearch();
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('Error', err.error?.message || 'Failed to update status', 'error');
          }
        });
      }
    });
  }

  rejectCondemnation(vehicleNumber: string) {
    Swal.fire({
      title: 'Reject Condemnation',
      text: 'Please provide a reason for rejecting this condemnation request:',
      input: 'textarea',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.isLoading = true;
        this.vehicleService.rejectCondemnation({ vehicleNumber, reason: result.value }).subscribe({
          next: () => {
            this.isLoading = false;
            Swal.fire('Rejected', 'The condemnation request has been rejected.', 'success');
            this.onSearch();
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('Error', err.error?.message || 'Failed to reject request', 'error');
          }
        });
      }
    });
  }

  viewDocument(url: string) {
    if (!url) {
      Swal.fire('Info', 'No document available.', 'info');
      return;
    }
    // Assuming the backend serves files from a static path or similar. Adjust if API base is needed.
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5000/${url}`;
    window.open(fullUrl, '_blank');
  }
}
