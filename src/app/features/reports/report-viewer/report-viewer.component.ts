import { Component, OnInit, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 fw-bold mb-0">{{ title() }}</h2>
          <p class="text-muted small">{{ subtitle() }}</p>
        </div>
        <button class="btn btn-sm neumorphic-btn" (click)="exportData()">
          <i class="fas fa-download me-2"></i>Export CSV
        </button>
      </div>

      <div class="card neumorphic-card border-0 p-4">
        @if (isLoading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table custom-table">
              <thead>
                <tr>
                  @for (col of columns(); track col) {
                    <th>{{ col | titlecase }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of data(); track row) {
                  <tr>
                    @for (col of columns(); track col) {
                      <td>{{ row[col] }}</td>
                    }
                  </tr>
                } @empty {
                  <tr>
                    <td [attr.colspan]="columns().length" class="text-center py-4 text-muted">
                      No data found for this report.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class ReportViewerComponent implements OnInit {
  title = signal<string>('Report');
  subtitle = signal<string>('Detailed analysis view');
  data = signal<any[]>([]);
  columns = signal<string[]>([]);
  isLoading = signal<boolean>(false);

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const reportType = this.route.snapshot.data['type'];
    this.configureReport(reportType);
  }

  configureReport(type: string): void {
    this.isLoading.set(true);
    let endpoint = '';

    switch (type) {
      case 'allocation':
        this.title.set('Allocation Analysis');
        this.subtitle.set('Distribution of vehicles by type');
        endpoint = '/reports/allocation-wise';
        break;
      case 'expenditure':
        this.title.set('Expenditure Report');
        this.subtitle.set('Financial summary by voucher type');
        endpoint = '/reports/expenditure';
        break;
      case 'odometer':
        this.title.set('Odometer Audit');
        this.subtitle.set('Vehicles with potential reading discrepancies');
        endpoint = '/reports/odometer-issues';
        break;
      case 'unverified':
        this.title.set('Verification Audit');
        this.subtitle.set('Pending verifications across departments');
        endpoint = '/reports/unverified';
        break;
    }

    this.apiService.get<any[]>(endpoint).subscribe({
      next: (res) => {
        this.data.set(res);
        if (res.length > 0) {
          this.columns.set(Object.keys(res[0]));
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  exportData(): void {
    // Simple CSV export logic can go here
    console.log('Exporting...', this.data());
  }
}
