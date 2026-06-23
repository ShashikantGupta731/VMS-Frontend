import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { AppDataTableComponent, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { MasterService, Officer } from '@core/services/master';

@Component({
  selector: 'app-view-officers',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppPaginationComponent, AppDataTableComponent],
  templateUrl: './officers.component.html',
  styleUrl: './officers.component.scss',
})
export class ViewOfficersComponent {
  constructor(private router: Router, private masterService: MasterService) { }

  currentPage = signal(1);
  itemsPerPage = signal(10);

  private officersResource = rxResource({
    stream: () => this.masterService.getOfficers()
  });

  allOfficers = computed(() => this.officersResource.value() ?? []);
  isLoading = this.officersResource.isLoading;
  totalItems = computed(() => this.allOfficers().length);

  paginatedOfficers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.allOfficers().slice(startIndex, endIndex);
  });

  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));

  tableColumns = [
    { key: 'officerName', label: 'OFFICER NAME' },
    { key: 'hrmsCode', label: 'HRMS CODE' },
    { key: 'departmentName', label: 'DEPARTMENT' },
    { key: 'designationName', label: 'DESIGNATION' },
    { key: 'fuelLimit', label: 'FUEL LIMIT' },
    { key: 'maintenanceLimit', label: 'MAINTENANCE LIMIT' },
    { key: 'remarks', label: 'REMARKS' },
    { 
      key: 'fileName', 
      label: 'UPLOADED DOCUMENT',
      render: (value: string) => value ? `<a href="${value}" target="_blank" class="text-primary"><i class="fas fa-file-alt"></i> View</a>` : '<span class="text-muted">No File</span>'
    },
    { 
      key: 'updatedOn', 
      label: 'UPDATED ON',
      render: (value: string) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'
    }
  ];

  tableActions: TableAction[] = [
    {
      label: 'Edit',
      icon: '<i class="pi pi-pencil"></i>',
      action: (row: Officer) => this.onEditOfficer(row),
    },
    {
      label: 'Delete',
      icon: '<i class="pi pi-trash"></i>',
      action: (row: Officer) => this.onDeleteOfficer(row),
      variant: 'danger',
    },
  ];

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onAddNewOfficer(): void {
    this.router.navigate(['/master/officer/add']);
  }

  onEditOfficer(officer: Officer): void {
    this.router.navigate(['/master/officer/edit', officer.id]);
  }

  onDeleteOfficer(officer: Officer): void {
    if (confirm(`Are you sure you want to delete officer ${officer.officerName}?`)) {
        this.masterService.deleteOfficer(officer.id).subscribe({
            next: () => {
                this.officersResource.reload();
            }
        });
    }
  }

  onGoBackToHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
