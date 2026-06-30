import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services/auth';
import { AppRole } from '@core/config/roles.enum';
import { DashboardService, DashboardSummaryDto } from '@shared/services/dashboard.service';
import { DashboardStatsCardComponent } from '../components/dashboard-stats-card.component';
import { DashboardQuickActionsComponent, QuickAction } from '../components/dashboard-quick-actions.component';
import { LoadingSpinner } from '@shared/components/loading-spinner/loading-spinner';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-master-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardStatsCardComponent,
    DashboardQuickActionsComponent,
    LoadingSpinner
  ],
  templateUrl: './master-dashboard.component.html',
  styleUrl: './master-dashboard.component.scss'
})
export class MasterDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private destroyRef = inject(DestroyRef);

  currentUser = this.authService.currentUser;
  userRole = signal<string>('GUEST');
  
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  summaryData = signal<DashboardSummaryDto | null>(null);
  quickActions = signal<QuickAction[]>([]);

  // Expose AppRole to template
  AppRole = AppRole;

  ngOnInit() {
    const role = this.currentUser()?.roles?.[0] || 'GUEST';
    this.userRole.set(role);
    this.setupQuickActions(role);
    this.fetchDashboardData();
  }

  private fetchDashboardData() {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.getSummary()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.summaryData.set(response.result);
          } else {
            this.error.set(response.message || 'Failed to load dashboard data');
          }
        },
        error: (err) => {
          console.error('Dashboard API Error', err);
          this.error.set('An error occurred while fetching dashboard data.');
        }
      });
  }

  private setupQuickActions(role: string) {
    let actions: QuickAction[] = [];

    switch (role) {
      case AppRole.DDO:
        actions = [
          { label: 'Add Vehicle', icon: 'pi pi-plus', route: '/vehicles/add', color: '#198754' },
          { label: 'Vehicle List', icon: 'pi pi-car', route: '/vehicle', color: '#0d6efd' },
          { label: 'Create Fuel Voucher', icon: 'pi pi-file', route: '/fuel-claims', color: '#fd7e14' },
          { label: 'Send Bills to IFMS', icon: 'pi pi-send', route: '/bill-integration', color: '#6610f2' },
          { label: 'Treasury Claims', icon: 'pi pi-wallet', route: '/ifms-claims', color: '#0dcaf0' }
        ];
        break;
      case AppRole.Administrator:
        actions = [
          { label: 'Verify Vehicles', icon: 'pi pi-check-circle', route: '/verify-vehicles', color: '#198754' },
          { label: 'Odometer Correction', icon: 'pi pi-sync', route: '/odometer-correction', color: '#fd7e14' },
          { label: 'Update Vehicle Details', icon: 'pi pi-car', route: '/vehicle/update-vehicle-details', color: '#0d6efd' },
          { label: 'User Management', icon: 'pi pi-users', route: '/user-management', color: '#6610f2' },
          { label: 'Reports', icon: 'pi pi-chart-bar', route: '/reports', color: '#0dcaf0' }
        ];
        break;
      case AppRole.NDOF:
        actions = [
          { label: 'Claim Verification', icon: 'pi pi-file-check', route: '/claim-verification', color: '#198754' },
          { label: 'Reports', icon: 'pi pi-chart-bar', route: '/reports', color: '#0d6efd' }
        ];
        break;
      case AppRole.Secretary:
      case AppRole.HOD:
      case AppRole.DeputyCommissioner:
        actions = [
          { label: 'Reports', icon: 'pi pi-chart-bar', route: '/reports', color: '#0dcaf0' },
          { label: 'User Management', icon: 'pi pi-users', route: '/user-management', color: '#6610f2' },
          { label: 'Vehicle List', icon: 'pi pi-car', route: '/vehicle', color: '#0d6efd' }
        ];
        break;
      case AppRole.FD:
        actions = [
          { label: 'FD Approval', icon: 'pi pi-check-square', route: '/vehicles/condemned/fd-approval', color: '#198754' },
          { label: 'Reports', icon: 'pi pi-chart-bar', route: '/reports', color: '#0d6efd' }
        ];
        break;
      case AppRole.RevenueOfficer:
        actions = [
          { label: 'Vehicle List', icon: 'pi pi-car', route: '/vehicle', color: '#0d6efd' }
        ];
        break;
    }

    this.quickActions.set(actions);
  }


  formatActivityAction(activity: any): string {
    const method = activity.action?.toUpperCase();
    if (method === 'POST') return 'Created / Submitted';
    if (method === 'PUT') return 'Updated';
    if (method === 'DELETE') return 'Deleted';
    if (method === 'PATCH') return 'Modified';
    return 'Action Performed';
  }

  formatActivityDetail(activity: any): string {
    let route = activity.detail || '';
    route = route.replace('/api/', '');
    
    // Map common routes to human readable text
    if (route.includes('Vehicles')) return 'Vehicle Record';
    if (route.includes('BillIntegration')) return 'IFMS Bill Integration';
    if (route.includes('Dashboard')) return 'Dashboard Data';
    if (route.includes('Users')) return 'User Record';
    
    // Fallback: Just return a cleaned up version of the route
    return route.split('/').pop() || route;
  }
}
