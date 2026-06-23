import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '@core/services/auth';
import { ChangePasswordComponent } from '@features/auth/change-password/change-password';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ChangePasswordComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  isDropdownOpen = signal(false);
  showPasswordModal = false;

  @Output() sidebarToggle = new EventEmitter<void>();

  constructor() {}


  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
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
  }
}
