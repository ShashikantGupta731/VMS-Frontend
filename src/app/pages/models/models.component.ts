import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppCardComponent } from '../../shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '../../shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '../../shared/components/ui/app-pagination/pagination.component';
import { ModelsService, VehicleModel } from './models.service';

@Component({
  selector: 'app-models',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppPaginationComponent],
  templateUrl: './models.component.html',
  styleUrl: './models.component.scss',
})
export class ModelsComponent implements OnInit {
  constructor(private router: Router, private modelsService: ModelsService) {}

  models: VehicleModel[] = [];
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  isLoading = false;

  tableColumns = [
    { key: 'modelName', label: 'Model Name' },
    { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'seatingCapacity', label: 'Seating Capacity' },
    { key: 'vehicleType', label: 'Vehicle Type' },
  ];

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    this.isLoading = true;
    this.modelsService.getModels(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: { data: VehicleModel[]; total: number }) => {
        this.models = response.data;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading models:', error);
        this.isLoading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadModels();
  }

  onGoBackToHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
