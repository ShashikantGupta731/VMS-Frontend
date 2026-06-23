import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppDataTableComponent, TableAction } from '@shared/components/ui/app-data-table/data-table.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { SecretaryService, SecretaryDto } from '@shared/services/secretary.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-secretaries-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppCardComponent,
    AppDataTableComponent,
    AppButtonComponent
  ],
  templateUrl: './secretaries-list.html',
})
export class SecretariesListComponent implements OnInit {
  private secretaryService = inject(SecretaryService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  secretaries: SecretaryDto[] = [];
  isLoading = false;

  tableColumns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'emailId', label: 'Email ID', sortable: true },
    { key: 'departmentName', label: 'Department', sortable: true },
    { key: 'isActive', label: 'Status', sortable: true },
  ];

  tableActions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'bx bx-edit',
      variant: 'outline-primary',
      action: (row: SecretaryDto) => this.editSecretary(row.secretaryId)
    },
    {
      label: 'Toggle Status',
      icon: 'bx bx-transfer',
      variant: 'outline-secondary',
      action: (row: SecretaryDto) => this.toggleStatus(row.secretaryId)
    }
  ];

  ngOnInit(): void {
    this.loadSecretaries();
  }

  loadSecretaries(): void {
    this.isLoading = true;
    this.secretaryService.getAllSecretaries().subscribe({
      next: (data) => {
        this.secretaries = data.map(s => ({
          ...s,
          isActiveText: s.isActive ? 'Active' : 'Inactive'
        }));
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load secretaries');
        this.isLoading = false;
      }
    });
  }

  editSecretary(id: number): void {
    this.router.navigate(['/master/secretaries/edit', id]);
  }

  toggleStatus(id: number): void {
    this.secretaryService.toggleSecretaryStatus(id).subscribe({
      next: () => {
        this.toastr.success('Status toggled successfully');
        this.loadSecretaries();
      },
      error: () => {
        this.toastr.error('Failed to toggle status');
      }
    });
  }
}
