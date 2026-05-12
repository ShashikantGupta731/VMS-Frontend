import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { AppDataTableComponent, TableColumn } from '@shared/components/ui/app-data-table/data-table.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { OfficesService } from './offices.service';
import { Office } from '@core/services/master';

@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppPaginationComponent, AppDataTableComponent],
  templateUrl: './offices.component.html',
  styleUrl: './offices.component.scss',
})
export class OfficesComponent {
  constructor(private router: Router, private officesService: OfficesService) { }

  currentPage = signal(1);
  itemsPerPage = signal(10);

  private officesResource = rxResource({
    stream: () => this.officesService.getOffices()
  });

  allOffices = computed(() => this.officesResource.value() ?? []);
  isLoading = this.officesResource.isLoading;
  totalItems = computed(() => this.allOffices().length);

  paginatedOffices = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.allOffices().slice(startIndex, endIndex);
  });

  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));

  // Multi-line data mapping for a richer UI
  tableColumns: TableColumn[] = [
    { key: 'officeName', label: 'Office Name' },
    { 
      key: 'districtName', 
      label: 'Location',
      render: (val, row) => `
        <div>${row.tehsilName || ''}</div>
        <div class="small text-muted">${val || ''} District</div>
      `
    },
    { 
      key: 'departmentName', 
      label: 'Department',
      render: (val) => `<span class="badge bg-light text-dark border">${val}</span>`
    },
    { key: 'officeAddress', label: 'Office Address' }
  ];

  tableActions = [
    {
      label: 'Edit',
      action: (row: Office) => this.onEditOffice(row),
      class: 'btn-sm',
    },
  ];

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onAddNewOffice(): void {
    this.router.navigate(['/offices/add-office']);
  }

  onEditOffice(office: Office): void {
    this.router.navigate(['/offices/edit', office.id]);
  }

  onGoBackToHome(): void {
    this.router.navigate(['/vehicle']);
  }
}
