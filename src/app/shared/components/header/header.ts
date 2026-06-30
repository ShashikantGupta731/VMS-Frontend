import { Component, Output, EventEmitter, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '@core/services/auth';
import { ChangePasswordComponent } from '@features/auth/change-password/change-password';
import { DashboardService, PendingActionDto } from '@shared/services/dashboard.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ChangePasswordComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  currentUser = this.authService.currentUser;
  isDropdownOpen = signal(false);
  isNotificationOpen = signal(false);
  showPasswordModal = false;
  notifications = signal<PendingActionDto[]>([]);

  @Output() sidebarToggle = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    // Only fetch if user is logged in
    if (this.currentUser()) {
      this.dashboardService.getSummary(true).subscribe({
        next: (res) => {
          if (res.success && res.result?.pendingActions) {
            this.notifications.set(res.result.pendingActions);
          }
        },
        error: () => {
          // Silent fail for notifications
        }
      });
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
    if (this.isDropdownOpen()) this.isNotificationOpen.set(false);
  }

  toggleNotification(): void {
    this.isNotificationOpen.update(v => !v);
    if (this.isNotificationOpen()) {
      this.isDropdownOpen.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  openChangePasswordModal(): void {
    this.showPasswordModal = true;
    this.isDropdownOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.isDropdownOpen.set(false);
    this.isNotificationOpen.set(false);
  }
}
