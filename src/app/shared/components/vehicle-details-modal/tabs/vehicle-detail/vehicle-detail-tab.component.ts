import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleDetail } from '../../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../../vehicle-details-modal.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-vehicle-detail-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-detail-tab.component.html',
  styleUrl: './vehicle-detail-tab.component.scss',
})
export class VehicleDetailTabComponent {
  vehicleId = input.required<number>();
  
  private resource = rxResource<VehicleDetail | null, number>({
    params: () => this.vehicleId(),
    stream: ({ params }) => this.vehicleDetailsService.getVehicleDetails(params.toString())
  });

  vehicleDetail = computed(() => this.resource.value() ?? null);
  isLoading = this.resource.isLoading;
  error = computed(() => {
    const err = this.resource.error();
    return err ? 'Failed to load vehicle details' : null;
  });

  constructor(private vehicleDetailsService: VehicleDetailsModalService) {}
}
