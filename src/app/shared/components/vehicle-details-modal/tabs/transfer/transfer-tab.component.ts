import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyValueListComponent } from '../../../ui/app-key-value-list/key-value-list.component';
import { TransferHistory } from '../../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../../vehicle-details-modal.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-transfer-tab',
  standalone: true,
  imports: [CommonModule, KeyValueListComponent],
  templateUrl: './transfer-tab.component.html',
  styleUrl: './transfer-tab.component.scss',
})
export class TransferTabComponent {
  vehicleId = input.required<number>();
  
  private resource = rxResource({
    params: () => this.vehicleId(),
    stream: ({ params }) => this.vehicleDetailsService.getTransferHistory(params.toString())
  });

  transferHistory = computed(() => this.resource.value() ?? []);
  isLoading = this.resource.isLoading;
  error = computed(() => {
    const err = this.resource.error();
    return err ? 'Failed to load transfer history' : null;
  });

  constructor(private vehicleDetailsService: VehicleDetailsModalService) {}
}
