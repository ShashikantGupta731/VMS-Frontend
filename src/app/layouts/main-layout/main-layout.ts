import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '@shared/components/header/header';
import { Sidebar, SidebarMenuItem } from '@shared/components/sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '@core/services/auth';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, Header, Sidebar, RouterModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private authService = inject(AuthService);
  isSidebarCollapsed: boolean = true;
  isSidebarHidden: boolean = false;
  currentUser = this.authService.currentUser;
  menuItems = computed(() => {
    const role = this.currentUser()?.roles?.[0] || 'GUEST';
    return this.buildMenuForRole(role);
  });

  private buildMenuForRole(role: string): SidebarMenuItem[] {
    switch (role) {
      case 'DDO': // IFMS Bill Clerk / Data Entry User
        return [
          { label: 'Dashboard', route: '/dashboard', icon: 'fas fa-home' },
          { label: 'Vehicles', route: '/vehicle', icon: 'fas fa-car' },
          {
            label: 'Masters',
            icon: 'fas fa-database',
            children: [
              { label: 'Offices', route: '/master/office', icon: 'fas fa-building' },
              { label: 'Models', route: '/models', icon: 'fas fa-car' },
              { label: 'Designations', route: '/designations', icon: 'fas fa-user-tie' }
            ]
          },
          {
            label: 'Bills',
            icon: 'fas fa-file-invoice-dollar',
            children: [
              { label: 'All Vouchers', route: '/bill-voucher', icon: 'fas fa-th-list' },
              { label: 'Fuel Bills', route: '/fuel-claims', icon: 'fas fa-gas-pump' },
              { label: 'Maintenance Bills', route: '/maintenance-voucher', icon: 'fas fa-tools' },
              { label: 'Hired Vehicle Bills', route: '/hired-vehicle-voucher', icon: 'fas fa-taxi' },
              { label: 'Contractual Bills', route: '/contractual-requisite-vehicle-voucher', icon: 'fas fa-file-contract' },
              { label: 'Miscellaneous Bills', route: '/miscellaneous-store-voucher', icon: 'fas fa-box-open' }
            ]
          },
          {
            label: 'IFMS Integration',
            icon: 'fas fa-network-wired',
            children: [
              { label: 'Bills ready for IFMS', route: '/bill-integration', icon: 'fas fa-file-export' },
              { label: 'Bills to be Discarded', route: '/pending-bill-integration', icon: 'fas fa-trash-alt' }
            ]
          },
          {
            label: 'Claims',
            icon: 'fas fa-coins',
            children: [
              { label: 'Treasury (IFMS) Claims', route: '/ifms-claims', icon: 'fas fa-university' },
              { label: 'Non-Treasury Claims', route: '/non-ifms-claims', icon: 'fas fa-money-bill-wave' }
            ]
          },
          {
            label: 'Condemned Vehicles',
            icon: 'fas fa-car-crash',
            children: [
              { label: 'Mark for Condemned', route: '/vehicles/condemned/mark-condemned', icon: 'fas fa-ban' },
              { label: 'Treasury Deposit (GRN)', route: '/vehicles/condemned/deposit', icon: 'fas fa-receipt' }
            ]
          }
        ];
      case 'ADMN': // System Administrator
        return [
          { label: 'Dashboard', route: '/dashboard', icon: 'fas fa-home' },
          {
            label: 'Masters',
            icon: 'fas fa-database',
            children: [
              { label: 'Officers', route: '/master/officer', icon: 'fas fa-user-tie' },
              { label: 'Models', route: '/models', icon: 'fas fa-car' },
              { label: 'Designations', route: '/designations', icon: 'fas fa-user-tie' }
            ]
          },
          { label: 'Vehicle Verification', route: '/verify-vehicles', icon: 'fas fa-check-double' },
          { label: 'Claim Verification', route: '/claim-verification', icon: 'fas fa-clipboard-check' },
          { label: 'Odometer Correction', route: '/odometer-correction', icon: 'fas fa-tachometer-alt' },
          { label: 'Update Vehicle Details', route: '/vehicle/update-vehicle-details', icon: 'fas fa-edit' },
          { label: 'User Management', route: '/user-management', icon: 'fas fa-users-cog' },
          {
            label: 'Logs',
            icon: 'fas fa-clipboard-list',
            children: [
              { label: 'Activity Logs', route: '/user-management/activity-log', icon: 'fas fa-history' },
              { label: 'Error Logs', route: '/user-management/error-log', icon: 'fas fa-exclamation-triangle' }
            ]
          },
          { label: 'Reports', route: '/reports', icon: 'fas fa-chart-bar' }
        ];
      case 'HOD':
        return [
          {
            label: 'Masters',
            icon: 'fas fa-database',
            children: [
              { label: 'Offices', route: '/master/office', icon: 'fas fa-building' },
              { label: 'Models', route: '/models', icon: 'fas fa-car' }
            ]
          },
          { label: 'User Management', route: '/user-management', icon: 'fas fa-users' },
          { label: 'Reports', route: '/reports', icon: 'fas fa-chart-line' }
        ];
      case 'DCL':
        return [
          { label: 'Dashboard', route: '/dashboard', icon: 'fas fa-home' },
          {
            label: 'Masters',
            icon: 'fas fa-database',
            children: [
              { label: 'Models', route: '/models', icon: 'fas fa-car' }
            ]
          },
          { label: 'User Management', route: '/user-management', icon: 'fas fa-users' },
          { label: 'Reports', route: '/reports', icon: 'fas fa-chart-line' }
        ];
      case 'SEC':
        return [
          { label: 'Reports', route: '/reports', icon: 'fas fa-chart-line' },
          { label: 'Vehicle Status Update by FD', route: '/vehicles/condemned/fd-approval', icon: 'fas fa-sync' }
        ];
      case 'FD':
        return [
          { label: 'Dashboard', route: '/dashboard', icon: 'fas fa-home' },
          { label: 'Reports', route: '/reports', icon: 'fas fa-chart-bar' },
          { label: 'Vehicle Status Update by FD', route: '/vehicles/condemned/fd-approval', icon: 'fas fa-sync' }
        ];
      case 'NDOF':
        return [
          { label: 'Claim Verification', route: '/claim-verification', icon: 'fas fa-clipboard-check' }
        ];
      case 'PPOF':
        return [
          { label: 'Filled Fuel Details', route: '/ppo', icon: 'fas fa-gas-pump' },
          { label: 'Record Filling', route: '/ppo/fill-fuel', icon: 'fas fa-plus-circle' }
        ];
      case 'GUEST':
        return [
          { label: 'Fuel Consumption Detail', route: '/guest-report', icon: 'fas fa-search' }
        ];
      default:
        return [];
    }
  }

  constructor() {}


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
