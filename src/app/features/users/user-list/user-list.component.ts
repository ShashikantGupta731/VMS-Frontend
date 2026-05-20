import { Component, inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../user.interfaces';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppButtonComponent, AppDataTableComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  tableColumns: TableColumn[] = [
    { key: 'username', label: 'Username', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'roleDisplay', label: 'Roles' },
    { key: 'districtName', label: 'District' },
    { key: 'departmentName', label: 'Department' },
    { key: 'status', label: 'Status', textAlign: 'center', allowHtml: true }
  ];

  tableActions: TableAction[] = [
    {
      label: 'Edit',
      icon: '<i class="pi pi-pencil"></i>',
      variant: 'primary',
      action: (row: any) => this.router.navigate(['/user-management/edit', row.id])
    },
    {
      label: 'Reset Password',
      icon: '<i class="pi pi-key"></i>',
      variant: 'secondary',
      action: (row: any) => this.resetPassword(row)
    }
  ];

  private usersResource = rxResource<User[], {}>({
    stream: () => this.userService.getUsers()
  });

  users = computed(() => {
    const data = this.usersResource.value() ?? [];
    return data.map(user => ({
      ...user,
      roleDisplay: user.roles.join(', '),
      status: `<span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">${user.isActive ? 'Active' : 'Inactive'}</span>`
    }));
  });

  isLoading = this.usersResource.isLoading;

  refresh(): void {
    this.usersResource.reload();
  }

  resetPassword(user: any): void {
    // Navigate to reset password page or open a dialog
    this.router.navigate(['/user-management/reset-password', user.id]);
  }
}

