import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyValueListComponent } from '../../../ui/app-key-value-list/key-value-list.component';
import { AppCardComponent } from '../../../ui/app-card/card.component';
import { TransferHistory } from '../../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../../vehicle-details-modal.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-transfer-tab',
  standalone: true,
  imports: [CommonModule, KeyValueListComponent, AppCardComponent],
  templateUrl: './transfer-tab.component.html',
  styleUrl: './transfer-tab.component.scss',
})
export class TransferTabComponent {
  vehicleNumber = input.required<string>();
  
  private resource = rxResource({
    params: () => this.vehicleNumber(),
    stream: ({ params }) => this.vehicleDetailsService.getTransferHistory(params)
  });

  transferHistory = computed(() => this.resource.value() ?? []);
  isLoading = this.resource.isLoading;
  error = computed(() => {
    const err = this.resource.error();
    return err ? 'Failed to load transfer history' : null;
  });

  constructor(private vehicleDetailsService: VehicleDetailsModalService) {}
}
