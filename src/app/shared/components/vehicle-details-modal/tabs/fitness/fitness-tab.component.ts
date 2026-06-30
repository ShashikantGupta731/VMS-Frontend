import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDataTableComponent, TableColumn } from '../../../ui/app-data-table/data-table.component';
import { FitnessCertificate } from '../../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../../vehicle-details-modal.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppDocumentViewerComponent } from '../../../ui/app-document-viewer/document-viewer.component';

@Component({
  selector: 'app-fitness-tab',
  standalone: true,
  imports: [CommonModule, AppDataTableComponent, AppDocumentViewerComponent],
  templateUrl: './fitness-tab.component.html',
  styleUrl: './fitness-tab.component.scss',
})
export class FitnessTabComponent {
  vehicleId = input.required<number>();
  
  private resource = rxResource({
    params: () => this.vehicleId(),
    stream: ({ params }) => this.vehicleDetailsService.getFitnessCertificates(params.toString())
  });

  fitnessCertificates = computed(() => {
    const certs = this.resource.value() ?? [];
    return certs.filter(c => c.certificateIssuedDate && c.certificateIssuedDate !== '');
  });
  isLoading = this.resource.isLoading;
  error = computed(() => {
    const err = this.resource.error();
    return err ? 'Failed to load fitness certificates' : null;
  });

  columns: TableColumn[] = [
    { key: 'certificateIssuedDate', label: 'Certificate Issued Date' },
    { key: 'certificateExpiryDate', label: 'Certificate Expiry Date' }
  ];

  actions = [
    {
      label: 'Fitness Certificate',
      variant: 'primary' as const,
      action: (row: FitnessCertificate) => this.showPdfViewer(row.certificate)
    }
  ];

  viewerVisible = false;
  viewerDocumentPath = '';

  constructor(private vehicleDetailsService: VehicleDetailsModalService) {}

  showPdfViewer(path: string) {
    if (!path) return;
    this.viewerDocumentPath = path;
    this.viewerVisible = true;
  }
}
