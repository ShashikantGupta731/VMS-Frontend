import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../shared/components/header/header';
import { Sidebar, SidebarMenuItem } from '../../shared/components/sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, Header, Sidebar, RouterModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit {
  isSidebarCollapsed: boolean = true;
  isSidebarHidden: boolean = false;
  currentUser: User | null = null;
  menuItems: SidebarMenuItem[] = [
    {
      label: 'Masters',
      icon: 'fas fa-database',
      children: [
        { label: 'Offices', route: '/master/office', icon: 'fas fa-building' },
        { label: 'Models', route: '/models', icon: 'fas fa-car' },
        { label: 'Designations', route: '/designations', icon: 'fas fa-user-tie' }
      ]
    },
    { label: 'Vehicles', route: '/vehicle', icon: 'fas fa-truck' },
    { label: 'Bills ready for IFMS', route: '/bill-integration', icon: 'fas fa-file-invoice' },
    { label: 'Bills to be Discarded', route: '/pending-bill-integration', icon: 'fas fa-trash-alt' },
    { label: 'Treasury (IFMS) Claims', route: '/ifms-claims', icon: 'fas fa-coins' },
    { label: 'Non-Treasury Claims', route: '/non-ifms-claims', icon: 'fas fa-money-bill' },
    { label: 'Vehicle purchased against Condemned Vehicle', route: '/vehicle/new-vehicle-details', icon: 'fas fa-exchange-alt' },
    { label: 'Amount deposited against Condemned Vehicle', route: '/vehicle/condemned-vehicle-details', icon: 'fas fa-piggy-bank' },

  ];

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  onSidebarToggle(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  onSidebarMouseEnter(): void {
    // CSS handles hover expansion as overlay
  }

  onSidebarMouseLeave(): void {
    // CSS handles hover collapse
  }

  onMenuClick(item: SidebarMenuItem): void {
    // Handle menu item click if needed
    console.log('Menu item clicked:', item);
  }

  onLogout(): void {
    this.authService.logout();
    this.isSidebarCollapsed = true;
  }
}
