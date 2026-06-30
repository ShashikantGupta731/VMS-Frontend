import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PetrolPumpService, StockAmountDto, FuelLogDto } from '../../../core/services/petrol-pump.service';
import { AppCardComponent } from '../../../shared/components/ui/app-card/card.component';
import { AppDataTableComponent, TableColumn } from '../../../shared/components/ui/app-data-table/data-table.component';
import { AppButtonComponent } from '../../../shared/components/ui/app-button/button.component';

@Component({
  selector: 'app-ppo-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, AppDataTableComponent, AppButtonComponent],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './ppo-dashboard.component.html',
  styles: [`
    ::ng-deep .light-blue-pill-btn {
      background-color: #d3e3fd !important;
      color: #000 !important;
      border: none !important;
      height: 40px !important;
      display: flex !important;
      align-items: center !important;
    }
    ::ng-deep .light-blue-pill-btn:hover {
      background-color: #b9d0f9 !important;
    }
  `]
})
export class PpoDashboardComponent implements OnInit {
  private petrolPumpService = inject(PetrolPumpService);
  private datePipe = inject(DatePipe);
  
  stockAmount: StockAmountDto | null = null;
  logs: FuelLogDto[] = [];
  isLoading = true;

  tableColumns: TableColumn[] = [
    { key: 'serialNo', label: '#', textAlign: 'center' },
    { key: 'vehicleNumber', label: 'VEHICLE NUMBER', sortable: true },
    { key: 'fuelType', label: 'FUEL TYPE', sortable: true },
    { key: 'litres', label: 'FUEL QUANTITY IN LITRES', textAlign: 'center' },
    { 
      key: 'date', 
      label: 'DATE OF FILLING', 
      sortable: true,
      render: (val) => this.datePipe.transform(val, 'dd MMM yyyy')
    },
    { key: 'ddoCode', label: 'DDO CODE' },
    { key: 'officeName', label: 'OFFICE NAME' },
    { key: 'district', label: 'DISTRICT' },
    { key: 'departmentName', label: 'DEPARTMENT NAME' }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    this.petrolPumpService.getStockAmounts().subscribe(res => {
      if (res.success && res.result) {
        this.stockAmount = res.result;
      }
    });

    this.petrolPumpService.getRecentFuelLogs().subscribe(res => {
      if (res.success && res.result) {
        this.logs = res.result.map((log, index) => ({ ...log, serialNo: index + 1 }));
      }
      this.isLoading = false;
    });
  }
}
