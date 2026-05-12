import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '@core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  isDropdownOpen = signal(false);
  @Output() sidebarToggle = new EventEmitter<void>();

  constructor() {}


  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  logout(): void {
    this.authService.logout();
    this.isDropdownOpen.set(false);
  }
}
