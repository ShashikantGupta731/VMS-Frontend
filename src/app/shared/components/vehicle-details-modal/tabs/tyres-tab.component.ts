import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDataTableComponent, TableColumn } from '../../ui/app-data-table/data-table.component';
import { AppCardComponent } from '../../ui/app-card/card.component';
import { BillRecord } from '../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../vehicle-details-modal.service';

@Component({
  selector: 'app-tyres-tab',
  standalone: true,
  imports: [CommonModule, AppDataTableComponent, AppCardComponent],
  templateUrl: './tyres-tab.component.html',
  styleUrl: './tyres-tab.component.scss',
})
export class TyresTabComponent implements OnInit {
  @Input() vehicleNumber!: string;
  tyreChanges: BillRecord[] = [];
  isLoading = false;
  error: string | null = null;

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

  ngOnInit(): void {
    this.loadTyreChanges();
  }

  loadTyreChanges(): void {
    this.isLoading = true;
    this.error = null;
    this.vehicleDetailsService.getTyreChanges(this.vehicleNumber).subscribe({
      next: (data) => {
        this.tyreChanges = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tyre changes';
        this.isLoading = false;
      },
    });
  }
}
