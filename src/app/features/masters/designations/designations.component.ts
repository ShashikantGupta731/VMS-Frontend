import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { AppDataTableComponent, TableColumn } from '@shared/components/ui/app-data-table/data-table.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { DesignationsService } from './designations.service';
import { Designation } from '@core/services/master';

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AppCardComponent, AppButtonComponent, AppPaginationComponent, AppDataTableComponent],
  templateUrl: './designations.component.html',
  styleUrl: './designations.component.scss',
})
export class DesignationsComponent {
  constructor(private router: Router, private designationsService: DesignationsService) { }

  currentPage = signal(1);
  itemsPerPage = signal(10);
  searchText = signal('');

  private designationsResource = rxResource({
    stream: () => this.designationsService.getDesignations()
  });

  allDesignations = computed(() => {
    const data = this.designationsResource.value() ?? [];
    return data.map((d: any) => ({
      ...d,
      fuelLimitHtml: `Petrol - ${d.petrolFuelLimit}<br>Diesel - ${d.dieselFuelLimit}`,
      maintenanceLimitHtml: `Petrol - ${d.petrolMaintenanceLimit}<br>Diesel - ${d.dieselMaintenanceLimit}`
    }));
  });
  
  filteredDesignations = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const data = this.allDesignations();
    if (!search) return data;
    return data.filter((d: any) => 
      d.designationName?.toLowerCase().includes(search) || 
      d.departmentName?.toLowerCase().includes(search)
    );
  });

  isLoading = this.designationsResource.isLoading;
  totalItems = computed(() => this.filteredDesignations().length);

  paginatedDesignations = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filteredDesignations().slice(startIndex, endIndex);
  });

  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));

  tableColumns: TableColumn[] = [
    { key: 'designationName', label: 'DESIGNATION' },
    { key: 'departmentName', label: 'DEPARTMENT' },
    { key: 'fuelLimitHtml', label: 'FUEL LIMIT', allowHtml: true },
    { key: 'maintenanceLimitHtml', label: 'MAINTENANCE LIMIT', allowHtml: true },
    { key: 'designationType', label: 'DESIGNATION TYPE' }
  ];

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onGoBackToHome(): void {
    this.router.navigate(['/vehicle']);
  }
}
