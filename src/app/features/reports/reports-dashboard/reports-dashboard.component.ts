import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '@core/services/api';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.scss'
})
export class ReportsDashboardComponent implements OnInit {
  stats = signal<any>({
    unverified: 0,
    odometerIssues: 0,
    totalVehicles: 0
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // Unverified
    this.apiService.get<any[]>('/reports/unverified').subscribe(data => {
      const total = data.reduce((acc, curr) => acc + curr.unverifiedCount, 0);
      this.stats.update(s => ({ ...s, unverified: total }));
    });

    // Odometer
    this.apiService.get<any[]>('/reports/odometer-issues').subscribe(data => {
      const total = data.reduce((acc, curr) => acc + curr.issues, 0);
      this.stats.update(s => ({ ...s, odometerIssues: total }));
    });

    // Dept Wise (for total)
    this.apiService.get<any[]>('/reports/dept-wise').subscribe(data => {
      const total = data.reduce((acc, curr) => acc + curr.totalVehicles, 0);
      this.stats.update(s => ({ ...s, totalVehicles: total }));
    });
  }
}
