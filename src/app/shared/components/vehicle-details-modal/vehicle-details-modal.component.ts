import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCardComponent } from '../ui/app-card/card.component';
import { AppButtonComponent } from '../ui/app-button/button.component';
import { VehicleDetailTabComponent } from './tabs/vehicle-detail/vehicle-detail-tab.component';
import { FitnessTabComponent } from './tabs/fitness/fitness-tab.component';
import { FuelTabComponent } from './tabs/fuel/fuel-tab.component';
import { MaintenanceTabComponent } from './tabs/maintenance/maintenance-tab.component';
import { ServiceTabComponent } from './tabs/service/service-tab.component';
import { BatteryTabComponent } from './tabs/battery/battery-tab.component';
import { TyresTabComponent } from './tabs/tyres/tyres-tab.component';
import { TransferTabComponent } from './tabs/transfer/transfer-tab.component';
import { TabType } from './vehicle-details-modal.interfaces';

@Component({
  selector: 'app-vehicle-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    AppCardComponent,
    AppButtonComponent,
    VehicleDetailTabComponent,
    FitnessTabComponent,
    FuelTabComponent,
    MaintenanceTabComponent,
    ServiceTabComponent,
    BatteryTabComponent,
    TyresTabComponent,
    TransferTabComponent,
  ],
  templateUrl: './vehicle-details-modal.component.html',
  styleUrl: './vehicle-details-modal.component.scss',
})
export class VehicleDetailsModalComponent implements OnInit {
  @Input() vehicleNumber!: string;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();

  activeTab: TabType = 'vehicle-detail';
  tabs: { id: TabType; label: string }[] = [
    { id: 'vehicle-detail', label: 'Vehicle Detail' },
    { id: 'fitness', label: 'Fitness Certificate' },
    { id: 'fuel', label: 'Fuel Bill' },
    { id: 'maintenance', label: 'Maintenance Bill' },
    { id: 'service', label: 'Service Bill' },
    { id: 'battery', label: 'Battery Change' },
    { id: 'tyres', label: 'Tyres Changed' },
    { id: 'transfer', label: 'Transfer Vehicle' },
  ];

  loadedTabs: Set<TabType> = new Set(['vehicle-detail']);

  ngOnInit(): void {
    if (this.vehicleNumber) {
      this.loadedTabs.add('vehicle-detail');
    }
  }

  onTabChange(tabId: TabType): void {
    this.activeTab = tabId;
    if (!this.loadedTabs.has(tabId)) {
      this.loadedTabs.add(tabId);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  isTabActive(tabId: TabType): boolean {
    return this.activeTab === tabId;
  }

  isTabLoaded(tabId: TabType): boolean {
    return this.loadedTabs.has(tabId);
  }
}
