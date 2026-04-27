import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyValueListComponent } from '../../ui/app-key-value-list/key-value-list.component';
import { AppCardComponent } from '../../ui/app-card/card.component';
import { VehicleDetail } from '../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../vehicle-details-modal.service';

@Component({
  selector: 'app-vehicle-detail-tab',
  standalone: true,
  imports: [CommonModule, KeyValueListComponent, AppCardComponent],
  templateUrl: './vehicle-detail-tab.component.html',
  styleUrl: './vehicle-detail-tab.component.scss',
})
export class VehicleDetailTabComponent implements OnInit {
  @Input() vehicleNumber!: string;
  vehicleDetail: VehicleDetail | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private vehicleDetailsService: VehicleDetailsModalService) {}

  ngOnInit(): void {
    this.loadVehicleDetail();
  }

  loadVehicleDetail(): void {
    this.isLoading = true;
    this.error = null;
    this.vehicleDetailsService.getVehicleDetails(this.vehicleNumber).subscribe({
      next: (data) => {
        this.vehicleDetail = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load vehicle details';
        this.isLoading = false;
      },
    });
  }
}
