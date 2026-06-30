import { Component, inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { UserService } from '../user.service';
import { User } from '../user.interfaces';
import { AuthService } from '@core/services/auth';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn, TableAction } from '@shared/components/ui/app-data-table/data-table.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DialogModule, AppCardComponent, AppButtonComponent, AppDataTableComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  private authService = inject(AuthService);

  canAddUser = computed(() => {
    const user = this.authService.currentUser();
    // DCL and HOD cannot add users
    return user ? (!user.roles.includes('DCL') && !user.roles.includes('HOD')) : false;
  });

  tableColumns: TableColumn[] = [
    { key: 'username', label: 'Username', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'roleDisplay', label: 'Roles' },
    { key: 'districtName', label: 'District' },
    { key: 'departmentName', label: 'Department' },
    { key: 'status', label: 'Status', textAlign: 'center', allowHtml: true }
  ];

  get tableActions(): TableAction[] {
    const user = this.authService.currentUser();
    const isHOD = user?.roles?.includes('HOD');
    const isDCL = user?.roles?.includes('DCL');

    const actions: TableAction[] = [
      {
        label: 'Edit',
        icon: '<i class="pi pi-pencil"></i>',
        variant: 'primary',
        action: (row: any) => this.router.navigate(['/user-management/edit', row.id])
      }
    ];

    // Only allow non-HOD and non-DCL users to reset password
    if (!isHOD && !isDCL) {
      actions.push({
        label: 'Reset Password',
        icon: '<i class="pi pi-key"></i>',
        variant: 'secondary',
        action: (row: any) => this.resetPassword(row)
      });
    }

    return actions;
  }

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

  // Modal State Variables
  displayResetModal = false;
  selectedUser: User | null = null;
  newPassword = '';
  resetError = '';
  resetSuccess = '';

  resetPassword(user: any): void {
    this.selectedUser = user;
    this.newPassword = '';
    this.resetError = '';
    this.resetSuccess = '';
    this.displayResetModal = true;
  }

  confirmResetPassword(): void {
    if (!this.selectedUser || !this.newPassword) return;

    this.resetError = '';
    this.resetSuccess = '';

    this.userService.resetPassword(this.selectedUser.id, this.newPassword).subscribe({
      next: () => {
        this.resetSuccess = 'Password reset successfully!';
        setTimeout(() => {
          this.displayResetModal = false;
        }, 1500);
      },
      error: (err) => {
        this.resetError = err.error?.message || 'Failed to reset password.';
      }
    });
  }
}

