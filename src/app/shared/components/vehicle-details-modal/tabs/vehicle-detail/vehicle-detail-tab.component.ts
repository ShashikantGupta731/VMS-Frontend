import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyValueListComponent } from '../../../ui/app-key-value-list/key-value-list.component';
import { AppCardComponent } from '../../../ui/app-card/card.component';
import { VehicleDetail } from '../../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../../vehicle-details-modal.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-vehicle-detail-tab',
  standalone: true,
  imports: [CommonModule, KeyValueListComponent, AppCardComponent],
  templateUrl: './vehicle-detail-tab.component.html',
  styleUrl: './vehicle-detail-tab.component.scss',
})
export class VehicleDetailTabComponent {
  vehicleNumber = input.required<string>();
  
  private resource = rxResource<VehicleDetail | null, string>({
    params: () => this.vehicleNumber(),
    stream: ({ params }) => this.vehicleDetailsService.getVehicleDetails(params)
  });

  vehicleDetail = computed(() => this.resource.value() ?? null);
  isLoading = this.resource.isLoading;
  error = computed(() => {
    const err = this.resource.error();
    return err ? 'Failed to load vehicle details' : null;
  });

  constructor(private vehicleDetailsService: VehicleDetailsModalService) {}
}
