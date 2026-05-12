import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDataTableComponent, TableColumn } from '../../../ui/app-data-table/data-table.component';
import { AppCardComponent } from '../../../ui/app-card/card.component';
import { FitnessCertificate } from '../../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../../vehicle-details-modal.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-fitness-tab',
  standalone: true,
  imports: [CommonModule, AppDataTableComponent, AppCardComponent],
  templateUrl: './fitness-tab.component.html',
  styleUrl: './fitness-tab.component.scss',
})
export class FitnessTabComponent {
  vehicleNumber = input.required<string>();
  
  private resource = rxResource({
    params: () => this.vehicleNumber(),
    stream: ({ params }) => this.vehicleDetailsService.getFitnessCertificates(params)
  });

  fitnessCertificates = computed(() => this.resource.value() ?? []);
  isLoading = this.resource.isLoading;
  error = computed(() => {
    const err = this.resource.error();
    return err ? 'Failed to load fitness certificates' : null;
  });

  columns: TableColumn[] = [
    { key: 'certificateIssuedDate', label: 'Certificate Issued Date' },
    { key: 'certificateExpiryDate', label: 'Certificate Expiry Date' },
    { key: 'certificate', label: 'Certificate' },
  ];

  constructor(private vehicleDetailsService: VehicleDetailsModalService) {}
}
