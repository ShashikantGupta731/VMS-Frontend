import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '@core/services/api';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppButtonComponent],
  templateUrl: './inventory-dashboard.component.html',
  styleUrl: './inventory-dashboard.component.scss'
})
export class InventoryDashboardComponent implements OnInit {
  items = signal<any[]>([]);
  allotments = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    // Load Inventory Items & Their Stock Status
    this.apiService.get<any[]>('/inventory/items').subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load items', err);
        this.isLoading.set(false);
      }
    });

    // Load Recent Allotments
    this.apiService.get<any[]>('/inventory/history/allotments').subscribe({
      next: (data) => {
        this.allotments.set(data);
      }
    });
  }
}
