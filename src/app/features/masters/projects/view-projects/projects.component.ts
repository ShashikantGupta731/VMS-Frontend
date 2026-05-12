import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { AppDataTableComponent } from '@shared/components/ui/app-data-table/data-table.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { MasterService, Project } from '@core/services/master';

@Component({
  selector: 'app-view-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppPaginationComponent, AppDataTableComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ViewProjectsComponent {
  constructor(private router: Router, private masterService: MasterService) { }

  currentPage = signal(1);
  itemsPerPage = signal(10);

  private projectsResource = rxResource({
    stream: () => this.masterService.getProjects()
  });

  allProjects = computed(() => this.projectsResource.value() ?? []);
  isLoading = this.projectsResource.isLoading;
  totalItems = computed(() => this.allProjects().length);

  paginatedProjects = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.allProjects().slice(startIndex, endIndex);
  });

  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));

  tableColumns = [
    { key: 'name', label: 'Project Name' },
    { key: 'departmentId', label: 'Department ID' }, // We could join this for name if needed
    { key: 'petrolFuelLimit', label: 'Fuel Limit (L)' },
    { key: 'petrolMaintenanceLimit', label: 'Maint. Limit (₹)' }
  ];

  tableActions = [
    {
      label: 'Edit',
      action: (row: Project) => this.onEditProject(row),
      class: 'btn-sm btn-primary',
    },
    {
        label: 'Delete',
        action: (row: Project) => this.onDeleteProject(row),
        class: 'btn-sm btn-danger',
      },
  ];

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onAddNewProject(): void {
    this.router.navigate(['/master/project/add']);
  }

  onEditProject(project: Project): void {
    this.router.navigate(['/master/project/edit', project.id]);
  }

  onDeleteProject(project: Project): void {
    if (confirm(`Are you sure you want to delete project ${project.name}?`)) {
        this.masterService.deleteProject(project.id).subscribe({
            next: () => {
                this.projectsResource.reload();
            }
        });
    }
  }

  onGoBackToHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
