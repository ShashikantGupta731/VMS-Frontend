import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDataTableComponent, TableColumn } from '../../ui/app-data-table/data-table.component';
import { AppCardComponent } from '../../ui/app-card/card.component';
import { FitnessCertificate } from '../vehicle-details-modal.interfaces';
import { VehicleDetailsModalService } from '../vehicle-details-modal.service';

@Component({
  selector: 'app-fitness-tab',
  standalone: true,
  imports: [CommonModule, AppDataTableComponent, AppCardComponent],
  templateUrl: './fitness-tab.component.html',
  styleUrl: './fitness-tab.component.scss',
})
export class FitnessTabComponent implements OnInit {
  @Input() vehicleNumber!: string;
  fitnessCertificates: FitnessCertificate[] = [];
  isLoading = false;
  error: string | null = null;

  columns: TableColumn[] = [
    { key: 'certificateIssuedDate', label: 'Certificate Issued Date' },
    { key: 'certificateExpiryDate', label: 'Certificate Expiry Date' },
    { key: 'certificate', label: 'Certificate' },
  ];

  constructor(private vehicleDetailsService: VehicleDetailsModalService) {}

  ngOnInit(): void {
    this.loadFitnessCertificates();
  }

  loadFitnessCertificates(): void {
    this.isLoading = true;
    this.error = null;
    this.vehicleDetailsService.getFitnessCertificates(this.vehicleNumber).subscribe({
      next: (data) => {
        this.fitnessCertificates = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load fitness certificates';
        this.isLoading = false;
      },
    });
  }
}
