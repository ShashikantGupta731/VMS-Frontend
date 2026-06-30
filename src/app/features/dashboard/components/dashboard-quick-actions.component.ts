import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color?: string;
  description?: string;
}

@Component({
  selector: 'app-dashboard-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="quick-actions-grid">
      <div *ngFor="let action of actions" class="quick-action-item" [routerLink]="action.route">
        <div class="action-icon" [style.color]="action.color || 'var(--primary-color)'">
          <i [class]="action.icon"></i>
        </div>
        <div class="action-content">
          <h6 class="action-label">{{ action.label }}</h6>
          <p class="action-desc" *ngIf="action.description">{{ action.description }}</p>
        </div>
        <div class="action-arrow">
          <i class="pi pi-angle-right"></i>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard-quick-actions.component.scss'
})
export class DashboardQuickActionsComponent {
  @Input() actions: QuickAction[] = [];
}
