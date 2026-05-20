import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDataTableComponent, TableColumn } from '../../../ui/app-data-table/data-table.component';
import { BillRecord } from '../../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../../vehicle-details-modal.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-battery-tab',
  standalone: true,
  imports: [CommonModule, AppDataTableComponent],
  templateUrl: './battery-tab.component.html',
  styleUrl: './battery-tab.component.scss',
})
export class BatteryTabComponent {
  vehicleId = input.required<number>();
  
  private resource = rxResource({
    params: () => this.vehicleId(),
    stream: ({ params }) => this.vehicleDetailsService.getBatteryChanges(params.toString())
  });

  batteryChanges = computed(() => this.resource.value() ?? []);
  isLoading = this.resource.isLoading;
  error = computed(() => {
    const err = this.resource.error();
    return err ? 'Failed to load battery changes' : null;
  });

  columns: TableColumn[] = [
    { key: 'recordId', label: 'Record ID' },
    { key: 'claimNumber', label: 'Claim Number' },
    { key: 'subVoucherNo', label: 'Sub Voucher No.' },
    { key: 'date', label: 'Battery Change Date' },
    { key: 'amount', label: 'Battery Cost (Rs.)' },
    { key: 'odometerReading', label: 'Odometer Reading (KM)' },
    { key: 'sanctionOrderNo', label: 'Sanction Order No.' },
    { key: 'sanctionOrderDate', label: 'Sanction Order Date' },
    { key: 'sanctionAuthority', label: 'Sanction Authority' }
  ];

  actions = [
    {
      label: 'View Permission',
      variant: 'primary' as const,
      action: (row: BillRecord) => this.showPdfViewer(row.permissionNoc ?? ''),
      disabled: (row: BillRecord) => !row.permissionNoc || row.permissionNoc === ''
    }
  ];

  constructor(private vehicleDetailsService: VehicleDetailsModalService) {}

  showPdfViewer(path: string) {
    if (!path) return;
    window.open(path, '_blank');
  }
}
