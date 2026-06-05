import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PetrolPumpService, DashboardStatsDto, FuelLogDto } from '../../../core/services/petrol-pump.service';
import { AppCardComponent } from '../../../shared/components/ui/app-card/card.component';
import { AppDataTableComponent, TableColumn } from '../../../shared/components/ui/app-data-table/data-table.component';
import { AppButtonComponent } from '../../../shared/components/ui/app-button/button.component';

@Component({
  selector: 'app-ppo-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppDataTableComponent, AppButtonComponent],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './ppo-dashboard.component.html'
})
export class PpoDashboardComponent implements OnInit {
  private petrolPumpService = inject(PetrolPumpService);
  private datePipe = inject(DatePipe);
  private decimalPipe = inject(DecimalPipe);
  
  stats: DashboardStatsDto | null = null;
  logs: FuelLogDto[] = [];
  isLoading = true;

  tableColumns: TableColumn[] = [
    { key: 'vehicleNumber', label: 'Vehicle Number', sortable: true },
    { 
      key: 'date', 
      label: 'Date', 
      sortable: true,
      render: (val) => this.datePipe.transform(val, 'dd MMM yyyy')
    },
    { 
      key: 'fuelType', 
      label: 'Fuel Type',
      render: (val) => `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-1">${val}</span>`,
      allowHtml: true
    },
    { 
      key: 'litres', 
      label: 'Litres', 
      textAlign: 'right',
      render: (val) => `<span class="text-primary fw-semibold">${this.decimalPipe.transform(val, '1.2-2')}</span>`,
      allowHtml: true
    },
    { 
      key: 'amount', 
      label: 'Amount (₹)', 
      textAlign: 'right',
      render: (val) => `<span class="text-success fw-semibold">₹${this.decimalPipe.transform(val, '1.2-2')}</span>`,
      allowHtml: true
    }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    this.petrolPumpService.getDashboardStats().subscribe(res => {
      if (res.success && res.result) {
        this.stats = res.result;
      }
    });

    this.petrolPumpService.getRecentFuelLogs().subscribe(res => {
      if (res.success && res.result) {
        this.logs = res.result;
      }
      this.isLoading = false;
    });
  }
}
