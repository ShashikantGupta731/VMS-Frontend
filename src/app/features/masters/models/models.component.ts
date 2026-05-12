import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { AppDataTableComponent, TableColumn } from '@shared/components/ui/app-data-table/data-table.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { ModelsService } from './models.service';
import { VehicleModel } from '@core/services/master';
import { AuthService } from '@core/services/auth';

@Component({
  selector: 'app-models',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppPaginationComponent, AppDataTableComponent],
  templateUrl: './models.component.html',
  styleUrl: './models.component.scss',
})
export class ModelsComponent {
  constructor(private router: Router, private modelsService: ModelsService, private authService: AuthService) { }

  currentPage = signal(1);
  itemsPerPage = signal(10);

  private modelsResource = rxResource({
    stream: () => this.modelsService.getModels()
  });

  allModels = computed(() => this.modelsResource.value() ?? []);
  isLoading = this.modelsResource.isLoading;
  totalItems = computed(() => this.allModels().length);

  paginatedModels = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.allModels().slice(startIndex, endIndex);
  });

  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));

  // Multi-line data mapping
  tableColumns: TableColumn[] = [
    { 
      key: 'modelName', 
      label: 'Vehicle Model',
      render: (val, row) => `
        <div class="fw-bold text-primary">${val}</div>
        <div class="small text-muted">${row.manufacturerName || ''}</div>
      `
    },
    { key: 'vehicleType', label: 'Type' },
    { key: 'seatingCapacity', label: 'Capacity', render: (val) => `${val} Seater` }
  ];

  tableActions = [
    {
      label: 'Edit',
      action: (row: VehicleModel) => this.onEditModel(row),
      class: 'btn-sm',
    },
  ];

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onAddNewModel(): void {
    this.router.navigate(['/models/add']);
  }

  onEditModel(model: VehicleModel): void {
    this.router.navigate(['/models/edit', model.id]);
  }

  onGoBackToHome(): void {
    this.router.navigate(['/vehicle']);
  }

  // Check if current user has admin role
  isAdmin(): boolean {
    return this.authService.hasRole('Admin');
  }
}
