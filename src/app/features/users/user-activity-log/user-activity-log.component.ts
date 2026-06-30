import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppDataTableComponent, TableColumn } from '@shared/components/ui/app-data-table/data-table.component';
import { AppPaginationComponent } from '@shared/components/ui/app-pagination/pagination.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-activity-log',
  standalone: true,
  imports: [CommonModule, FormsModule, AppCardComponent, AppButtonComponent, AppDataTableComponent, AppPaginationComponent],
  template: `
    <div class="dashboard-container">
      <app-card customClass="no-padding">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-2 mb-4 border-bottom">
          <div>
            <h1 class="fs-28 fw-bold text-dark mb-1">User Activity Logs</h1>
            <p class="text-muted small m-0">View system-wide user actions and API usage.</p>
          </div>
        </div>

        <div class="row mb-4 align-items-end g-3 bg-light p-3 rounded mx-1">
          <div class="col-md-3">
            <label class="form-label small fw-bold">From Date</label>
            <input type="date" class="form-control" [(ngModel)]="fromDate">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold">To Date</label>
            <input type="date" class="form-control" [(ngModel)]="toDate">
          </div>
          <div class="col-md-2">
            <app-btn label="Search" (click)="search(1)" variant="dark-blue" size="md" icon="pi pi-search" customClass="w-100"></app-btn>
          </div>
        </div>

        <div class="mb-4 position-relative">
          @if (isLoading()) {
            <div class="table-loading-overlay">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          }

          <app-data-table
            [columns]="tableColumns"
            [data]="data()"
            [isLoading]="isLoading()"
            emptyMessage="No activity logs found for the selected date range.">
          </app-data-table>

          @if (totalCount() > 0) {
            <app-pagination
              [currentPage]="currentPage()"
              [totalPages]="Math.ceil(totalCount() / pageSize)"
              [totalItems]="totalCount()"
              [itemsPerPage]="pageSize"
              (pageChange)="search($event)">
            </app-pagination>
          }
        </div>
      </app-card>
    </div>
  `
})
export class UserActivityLogComponent {
  private userService = inject(UserService);
  Math = Math;

  fromDate: string = '';
  toDate: string = '';
  
  data = signal<any[]>([]);
  totalCount = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = 15;
  isLoading = signal<boolean>(false);

  tableColumns: TableColumn[] = [
    { key: 'username', label: 'User Name' },
    { key: 'profileName', label: 'Profile Name' },
    { key: 'ipAddress', label: 'IpAddress' },
    { key: 'method', label: 'Method' },
    { key: 'route', label: 'Route' },
    { key: 'api', label: 'Api' },
    { key: 'createdOnFormatted', label: 'CreatedOn' }
  ];

  ngOnInit() {
    // Set default to last 7 days
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    this.toDate = to.toISOString().split('T')[0];
    this.fromDate = from.toISOString().split('T')[0];
    this.search(1);
  }

  search(page: number) {
    this.isLoading.set(true);
    this.currentPage.set(page);
    this.userService.getActivityLogs(this.fromDate, this.toDate, page, this.pageSize)
      .subscribe({
        next: (res: any) => {
          const formattedData = res.data.map((item: any) => ({
            ...item,
            createdOnFormatted: new Date(item.createdOn).toLocaleString()
          }));
          this.data.set(formattedData);
          this.totalCount.set(res.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }
}
