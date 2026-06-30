import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-stats-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="stats-card h-100" [ngClass]="variant" [routerLink]="route" [class.cursor-pointer]="route">
      <div class="d-flex justify-content-between align-items-center">
        <div class="stats-icon-wrapper" [ngClass]="variant + '-icon'">
          <i [class]="icon"></i>
        </div>
        <div class="stats-info">
          <h6 class="stats-title" [ngClass]="variant + '-text'">{{ title }}</h6>
          <h2 class="stats-value" [ngClass]="variant + '-text'">{{ value | number }}</h2>
        </div>
      </div>
      <div class="stats-footer mt-3" *ngIf="trend || trendText">
        <span class="trend-indicator" [ngClass]="trend === 'up' ? 'text-success' : (trend === 'down' ? 'text-danger' : 'text-muted')">
          <i *ngIf="trend" [class]="trend === 'up' ? 'pi pi-arrow-up' : (trend === 'down' ? 'pi pi-arrow-down' : 'pi pi-minus')"></i>
          {{ trendValue }}
        </span>
        <span class="text-muted ms-1 text-sm">{{ trendText }}</span>
      </div>
    </div>
  `,
  styleUrl: './dashboard-stats-card.component.scss'
})
export class DashboardStatsCardComponent {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() icon: string = 'pi pi-chart-bar';
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' = 'primary';
  @Input() route?: string;
  @Input() trend?: 'up' | 'down' | 'neutral';
  @Input() trendValue?: string;
  @Input() trendText?: string;
}
