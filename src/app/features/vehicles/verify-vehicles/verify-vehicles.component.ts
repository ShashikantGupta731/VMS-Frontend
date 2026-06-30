import { Component, signal, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VerifyVehiclesService, VerifyVehicle } from './verify-vehicles.service';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { ToastrService } from 'ngx-toastr';
import { VehicleDetailsModalComponent } from '@shared/components/vehicle-details-modal/vehicle-details-modal.component';
import { AuthService } from '@core/services/auth';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { DialogModule } from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-verify-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AppCardComponent,
    AppButtonComponent,
    AppDataTableComponent,
    VehicleDetailsModalComponent,
    AppPaginationComponent,
    DialogModule
  ],
  templateUrl: './verify-vehicles.component.html',
  styleUrl: './verify-vehicles.component.scss'
})
export class VerifyVehiclesComponent {
  selectedStatus = signal<'pending' | 'objection' | 'verified'>('pending');
  isDetailsModalVisible = false;
  selectedVehicleId: number | null = null;
  selectedVehicleRegNo = '';

  // Document Viewer State
  isDocumentViewerVisible = signal(false);
  currentDocumentUrl = signal<SafeResourceUrl | null>(null);
  currentDocumentType = signal<'pdf' | 'image'>('image');
  imageZoomLevel = signal(1);

  statusOptions = [
    { value: 'pending' as const, label: 'Pending' },
    { value: 'objection' as const, label: 'Objection' },
    { value: 'verified' as const, label: 'Verified' }
  ];

  admnStatusArray: any[] = []; // Stores { vehicleinfoid, response, comment } for ADMN

  // ADMN search & pagination state
  admnSearchText = signal('');
  admnCurrentPage = signal(1);
  admnItemsPerPage = 10;

  // ADMN Search & Pagination computed signals
  admnFilteredVehicles = computed(() => {
    const list = this.vehicles();
    const search = this.admnSearchText().trim().toLowerCase();
    if (!search) return list;
    return list.filter(v => 
      v.vehicleNumber?.toLowerCase().includes(search) ||
      v.vmsManufacturer?.toLowerCase().includes(search) ||
      v.vmsModel?.toLowerCase().includes(search)
    );
  });

  admnPaginatedVehicles = computed(() => {
    const list = this.admnFilteredVehicles();
    const startIndex = (this.admnCurrentPage() - 1) * this.admnItemsPerPage;
    const endIndex = startIndex + this.admnItemsPerPage;
    return list.slice(startIndex, endIndex);
  });

  admnTotalItems = computed(() => this.admnFilteredVehicles().length);
  admnTotalPages = computed(() => Math.max(1, Math.ceil(this.admnTotalItems() / this.admnItemsPerPage)));

  onAdmnSearchChange(text: string) {
    this.admnSearchText.set(text);
    this.admnCurrentPage.set(1);
  }

  onAdmnPageChange(page: number) {
    this.admnCurrentPage.set(page);
  }

  getSelectedStatusValue(vehicleId: number): string {
    const item = this.admnStatusArray.find(x => x.vehicleinfoid === vehicleId);
    if (!item) return '';
    if (item.response === 1) return 'Approved';
    if (item.response === 2) return 'Objection';
    return '';
  }

  getCommentValue(vehicleId: number): string {
    const item = this.admnStatusArray.find(x => x.vehicleinfoid === vehicleId);
    return item?.comment || '';
  }

  // Table columns for DDO
  tableColumns: TableColumn[] = [
    { key: 'id', label: '#', width: '60px', textAlign: 'center' },
    { key: 'location', label: 'DEPARTMENT / DISTRICT OR STATE & TEHSIL', width: '200px', allowHtml: true },
    { key: 'officeDetails', label: 'OFFICE NAME / OFFICE ADDRESS / VEHICLE ALLOTED TO OFFICER NAME / VEHICLE ALLOTED TO OFFICER DESIGNATION', width: '250px', allowHtml: true },
    { key: 'vehicleDetails', label: 'MANUFACTURER / MAKE OR MODEL / MANUFACTURE YEAR / VEHICLE TYPE / VEHICLE NO. / SEATING CAPACITY', width: '250px', allowHtml: true },
    { key: 'fuelStatus', label: 'FUEL USED / FITNESS UPTO / ENGINE NO. OR CHASIS NO. / CURRENT STATUS', width: '200px', allowHtml: true },
    { key: 'verification', label: 'VERIFICATION STATUS DATE', width: '180px', allowHtml: true }
  ];

  constructor(
    private verifyVehiclesService: VerifyVehiclesService,
    private toastr: ToastrService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  get userRole(): string {
    if (this.authService.hasRole('ADMN')) return 'ADMN';
    if (this.authService.hasRole('DDO')) return 'DDO';
    return 'DDO'; // default fallback for testing
  }

  private vehiclesResource = rxResource<VerifyVehicle[], { status: 'pending' | 'objection' | 'verified', role: string }>({
    params: () => ({ status: this.selectedStatus(), role: this.userRole }),
    stream: ({ params }) => this.verifyVehiclesService.getVehicles(params.role, params.status)
  });

  vehicles = computed(() => this.vehiclesResource.value() ?? []);
  isLoading = this.vehiclesResource.isLoading;

  onStatusChange(status: 'pending' | 'objection' | 'verified'): void {
    this.selectedStatus.set(status);
  }

  viewDetails(vehicle: VerifyVehicle): void {
    this.selectedVehicleId = vehicle.id;
    this.selectedVehicleRegNo = vehicle.vehicleNumber;
    this.isDetailsModalVisible = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalVisible = false;
    this.selectedVehicleId = null;
    this.selectedVehicleRegNo = '';
  }

  viewObjection(vehicle: VerifyVehicle): void {
    console.log('View objection:', vehicle);
    // TODO: Implement view objection modal
  }

  viewDocument(path: string | undefined): void {
    if (!path || path === 'N/A' || path === 'null') {
      this.toastr.warning('Document is not available for this vehicle.');
      return;
    }

    const isPdf = path.toLowerCase().endsWith('.pdf');
    this.currentDocumentType.set(isPdf ? 'pdf' : 'image');
    this.imageZoomLevel.set(1); // Reset zoom
    
    // If it's an absolute URL, use directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      this.currentDocumentUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(path));
      this.isDocumentViewerVisible.set(true);
      return;
    }

    // Otherwise, assume it's relative to the backend static files path
    // Remove /api from the apiUrl to get the base domain (e.g. http://localhost:5261)
    const baseUrl = environment.apiUrl.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    this.currentDocumentUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(baseUrl + cleanPath));
    this.isDocumentViewerVisible.set(true);
  }

  zoomIn() {
    this.imageZoomLevel.update(z => Math.min(z + 0.5, 5));
  }

  zoomOut() {
    this.imageZoomLevel.update(z => Math.max(z - 0.5, 0.5));
  }

  zoomReset() {
    this.imageZoomLevel.set(1);
  }

  getActionsForStatus(status: 'pending' | 'objection' | 'verified'): TableAction[] {
    // DDO Actions
    if (this.userRole === 'DDO') {
      if (status === 'pending' || status === 'objection') {
        return [
          {
            label: 'View Details',
            action: (row: VerifyVehicle) => this.viewDetails(row),
            variant: 'primary'
          }
        ];
      }
      return [];
    }

    // ADMN actions could go here, but we will use native HTML table for ADMN
    return [];
  }

  // --- ADMN Logic Methods ---
  setStatus(vehicleId: number, statusValue: string) {
    const existingIdx = this.admnStatusArray.findIndex(item => item.vehicleinfoid === vehicleId);
    if (existingIdx > -1) {
      if (statusValue === 'Approved') {
        this.admnStatusArray[existingIdx].response = 1;
      } else if (statusValue === 'Objection') {
        this.admnStatusArray[existingIdx].response = 2;
      } else {
        this.admnStatusArray.splice(existingIdx, 1);
      }
    } else {
      if (statusValue === 'Approved') {
        this.admnStatusArray.push({ vehicleinfoid: vehicleId, response: 1, comment: null });
      } else if (statusValue === 'Objection') {
        this.admnStatusArray.push({ vehicleinfoid: vehicleId, response: 2, comment: null });
      }
    }
  }

  addComments(vehicleId: number, commentValue: string) {
    const existing = this.admnStatusArray.find(item => item.vehicleinfoid === vehicleId);
    if (existing) {
      existing.comment = commentValue;
    } else {
      this.admnStatusArray.push({ vehicleinfoid: vehicleId, response: null, comment: commentValue });
    }
  }

  submitAdmnResponse() {
    if (this.admnStatusArray.length > 0) {
      this.verifyVehiclesService.submitAdmnResponse(this.admnStatusArray).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Successfully Updated Record!!');
            this.admnStatusArray = [];
            this.vehiclesResource.reload();
          } else {
            this.toastr.error(res.message || 'Failed to update record');
          }
        },
        error: (error: any) => {
          console.error('Error submitting response:', error);
          this.toastr.error('Failed to submit verification');
        }
      });
    } else {
      this.toastr.warning('Please select the status for at least one vehicle');
    }
  }

  getFormattedVehicle(vehicle: VerifyVehicle): any {
    return {
      id: vehicle.id,
      location: this.formatLocation(vehicle),
      officeDetails: this.formatOfficeDetails(vehicle),
      vehicleDetails: this.formatVehicleDetails(vehicle),
      fuelStatus: this.formatFuelStatus(vehicle),
      verification: this.formatVerification(vehicle)
    };
  }

  private formatLocation(vehicle: VerifyVehicle): string {
    return `${vehicle.department || '-'} / <br> ${vehicle.district || '-'}`;
  }

  private formatOfficeDetails(vehicle: VerifyVehicle): string {
    return `${vehicle.officeName || '-'} / <br> ${vehicle.officeAddress || '-'} / <br> ${vehicle.officerName || '-'} / <br> ${vehicle.designation || '-'}`;
  }

  private formatVehicleDetails(vehicle: VerifyVehicle): string {
    return `${vehicle.manufacturer || '-'} / <br> ${vehicle.model || '-'} / <br> ${vehicle.manufactureYear || '-'} / <br> ${vehicle.vehicleType || '-'} / <br> <strong>${vehicle.vehicleNumber || '-'}</strong> / <br> ${vehicle.seatingCapacity || '-'}`;
  }

  private formatFuelStatus(vehicle: VerifyVehicle): string {
    return `${vehicle.fuelUsed || '-'} / <br> ${vehicle.fitnessUpto || '-'} / <br> ${vehicle.engineOrChassisNo || '-'} / <br> ${vehicle.currentStatus || '-'}`;
  }

  private formatVerification(vehicle: VerifyVehicle): string {
    const statusFormatted = this.getStatusBadge(vehicle.verificationStatus);
    const dateFormatted = vehicle.verificationDate || 'N/A';
    return `<span>${statusFormatted} <br> ${dateFormatted}</span>`;
  }

  private getStatusBadge(status: string): string {
    let color = 'black';
    if (status === 'pending') color = 'gray';
    if (status === 'verified') color = 'green';
    if (status === 'objection') color = 'red';
    
    return `<span style="color: ${color}; font-weight: 500">${status === 'pending' ? 'Verification Pending' : status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
  }

  getFormattedVehicles(): any[] {
    return this.vehicles().map(vehicle => this.getFormattedVehicle(vehicle));
  }
}
