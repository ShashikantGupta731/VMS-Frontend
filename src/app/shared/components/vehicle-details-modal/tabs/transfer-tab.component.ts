import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyValueListComponent } from '../../ui/app-key-value-list/key-value-list.component';
import { AppCardComponent } from '../../ui/app-card/card.component';
import { TransferHistory } from '../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../vehicle-details-modal.service';

@Component({
  selector: 'app-transfer-tab',
  standalone: true,
  imports: [CommonModule, KeyValueListComponent, AppCardComponent],
  templateUrl: './transfer-tab.component.html',
  styleUrl: './transfer-tab.component.scss',
})
export class TransferTabComponent implements OnInit {
  @Input() vehicleNumber!: string;
  transferHistory: TransferHistory[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private vehicleDetailsService: VehicleDetailsModalService) {}

  ngOnInit(): void {
    this.loadTransferHistory();
  }

  loadTransferHistory(): void {
    this.isLoading = true;
    this.error = null;
    this.vehicleDetailsService.getTransferHistory(this.vehicleNumber).subscribe({
      next: (data) => {
        this.transferHistory = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transfer history';
        this.isLoading = false;
      },
    });
  }
}
