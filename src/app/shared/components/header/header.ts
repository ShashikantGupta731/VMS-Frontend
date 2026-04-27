import { Component, OnInit, Output, EventEmitter, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  currentUser: User | null = null;
  isDropdownOpen = signal(false);
  @Output() sidebarToggle = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.detectChanges();
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
    this.cdr.detectChanges();
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  logout(): void {
    this.authService.logout();
    this.isDropdownOpen.set(false);
    this.cdr.detectChanges();
  }
}
