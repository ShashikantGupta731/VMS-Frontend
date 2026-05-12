import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDataTableComponent, TableColumn } from '../../../ui/app-data-table/data-table.component';
import { AppCardComponent } from '../../../ui/app-card/card.component';
import { BillRecord } from '../../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../../vehicle-details-modal.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-maintenance-tab',
  standalone: true,
  imports: [CommonModule, AppDataTableComponent, AppCardComponent],
  templateUrl: './maintenance-tab.component.html',
  styleUrl: './maintenance-tab.component.scss',
})
export class MaintenanceTabComponent {
  vehicleNumber = input.required<string>();
  
  private resource = rxResource({
    params: () => this.vehicleNumber(),
    stream: ({ params }) => this.vehicleDetailsService.getMaintenanceBills(params)
  });

  maintenanceBills = computed(() => this.resource.value() ?? []);
  isLoading = this.resource.isLoading;
  error = computed(() => {
    const err = this.resource.error();
    return err ? 'Failed to load maintenance bills' : null;
  });

  columns: TableColumn[] = [
    { key: 'recordId', label: 'Record ID' },
    { key: 'claimNumber', label: 'Claim Number' },
    { key: 'subVoucherNo', label: 'Sub Voucher No' },
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'odometerReading', label: 'Odometer Reading' },
    { key: 'sanctionOrderNo', label: 'Sanction Order No' },
    { key: 'sanctionOrderDate', label: 'Sanction Order Date' },
    { key: 'sanctionAuthority', label: 'Sanction Authority' },
    { key: 'permissionReceived', label: 'Permission Received' },
  ];

  constructor(private vehicleDetailsService: VehicleDetailsModalService) {}
}
