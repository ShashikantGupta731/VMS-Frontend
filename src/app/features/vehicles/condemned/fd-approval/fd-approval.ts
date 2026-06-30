import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppInputComponent } from '@shared/components/ui/app-input/input.component';
import { VehicleService } from '@shared/services/vehicle.service';
import { AppDocumentViewerComponent } from '@shared/components/ui/app-document-viewer/document-viewer.component';
import { AppDataTableComponent, TableAction, TableColumn } from '@shared/components/ui/app-data-table/data-table.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fd-approval',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppCardComponent, AppButtonComponent, AppInputComponent, AppDocumentViewerComponent, AppDataTableComponent],
  templateUrl: './fd-approval.html',
  styleUrls: ['./fd-approval.scss']
})
export class FdApprovalComponent implements OnInit {
  searchForm: FormGroup;
  vehicles: any[] = [];
  isLoading = false;
  viewerVisible = false;
  viewerDocumentPath = '';

  tableColumns: TableColumn[] = [
    { key: 'index', label: '#', allowHtml: true },
    { key: 'departmentLocation', label: 'DEPARTMENT <br><br> LOCATION', allowHtml: true },
    { key: 'officeInfo', label: 'OFFICE NAME,DDO CODE AND ADDRESS <br><br> ALLOTED TO OFFICER NAME <br> ALLOTED TO DESIGNATION', allowHtml: true },
    { key: 'vehicleDetails', label: 'VEHICLE NUMBER <br> VEHICLE TYPE <br> MAKE OR MODEL <br> MANUFACTURER <br> MANUFACTURE YEAR <br> SEATING CAPACITY', allowHtml: true },
    { key: 'fuelFitnessStatus', label: 'FUEL USED <br> FITNESS UPTO <br> ENGINE NO. OR CHASIS NO. <br> CURRENT STATUS <br> IS VERIFIED <br> TREASURY TYPE', allowHtml: true },
    { key: 'fitnessUpto', label: 'FITNESS UPTO', allowHtml: true },
  ];

  tableActions: TableAction[] = [
    { label: 'Details', icon: '<i class="pi pi-eye"></i>', action: (row: any) => this.viewDocument(row.original.fdApproval) },
    { label: 'Mark for Condemned', icon: '<i class="pi pi-check-square"></i>', action: (row: any) => this.markForCondemned(row.original.vehicleNumber || row.original.registrationNumber) }
  ];

  tableData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService
  ) {
    this.searchForm = this.fb.group({
      vehicleNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSearch() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const vehicleNumber = this.searchForm.get('vehicleNumber')?.value;
    this.isLoading = true;
    
    this.vehicleService.getVehiclesByNumber(vehicleNumber).subscribe({
      next: (res: any[]) => {
        this.isLoading = false;
        // Filter out vehicles that are already condemned/sold/marked
        this.vehicles = res.filter(v => !['Condemned', 'Sold', 'Marked for Condemned by FD'].includes(v.currentStatus));
        if (this.vehicles.length === 0) {
          this.tableData = [];
          Swal.fire('Info', 'No eligible vehicles found for this Vehicle Number.', 'info');
        } else {
          this.mapTableData();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.tableData = [];
        Swal.fire('Error', 'Failed to fetch vehicles', 'error');
      }
    });
  }

  private mapTableData() {
    this.tableData = this.vehicles.map((v, i) => {
      const isVerified = v.verificationStatus === 1;
      const verifiedStr = isVerified 
        ? `<span style="color: rgb(9, 207, 10)">Verified <i class="fas fa-check-circle"></i></span>`
        : `<span>Unverified</span>`;
        
      const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
      };
        
      return {
        index: `<strong>${i + 1}</strong>`,
        departmentLocation: `<div>${v.department || 'N/A'}</div><br><div>${v.district || 'N/A'}</div>`,
        officeInfo: `<div>${v.officeName || 'N/A'},</div><div>${v.officeAddress || 'N/A'}</div><br><div>${v.officerName || 'N/A'}</div><br><div>${v.designation || 'N/A'}</div>`,
        vehicleDetails: `<div>${v.registrationNumber || v.vehicleNumber || 'N/A'}</div><div>${v.vehicleType || 'N/A'}</div><div>${v.model || 'N/A'}</div><div>${v.manufacturer || 'N/A'}</div><div>${v.manufactureYear || 'N/A'}</div><div>${v.seatingCapacity || 'N/A'}</div>`,
        fuelFitnessStatus: `<div>${v.fuelUsed || 'N/A'}</div><div>${formatDate(v.fitnessUpto)}</div><div>${v.chassisNumber || 'N/A'}</div><div>${v.currentStatus || 'N/A'}</div><div>${verifiedStr}</div><div>${v.treasuryType || 'N/A'}</div>`,
        fitnessUpto: `<div>${formatDate(v.fitnessUpto)}</div>`,
        original: v
      };
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
    this.viewerDocumentPath = url;
    this.viewerVisible = true;
  }
}
