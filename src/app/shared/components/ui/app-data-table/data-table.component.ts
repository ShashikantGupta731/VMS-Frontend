import { Component, Input, Output, EventEmitter, ViewEncapsulation, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  textAlign?: 'left' | 'center' | 'right';
  allowHtml?: boolean;
  render?: (value: any, row?: any) => any;
}

export interface TableAction {
  label: string | ((row: any) => string);
  icon?: string | ((row: any) => string);
  action: (row: any) => void;
  disabled?: (row: any) => boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | ((row: any) => string);
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, TableModule, TooltipModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AppDataTableComponent implements DoCheck {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() sortable: boolean = false;
  @Input() selectable: boolean = false;
  @Input() selectAll: boolean = false;
  @Input() actions?: TableAction[];
  @Input() emptyMessage: string = 'No data available';
  @Input() showEmptyIcon: boolean = true;
  @Input() isLoading: boolean = false;
  @Input() customClass?: string;
  @Input() rowDisabled?: (row: any) => boolean;
  @Input() rowSelected?: (row: any) => boolean;

  @Output() sort = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();
  @Output() select = new EventEmitter<{ row: any; selected: boolean }>();
  @Output() selectAllChange = new EventEmitter<boolean>();

  // For PrimeNG selection
  selectedRows: any[] = [];

  ngDoCheck(): void {
    if (this.selectable && this.rowSelected) {
      const parentSelectedRows = this.data.filter(row => this.rowSelected!(row));
      // Only update if lengths differ or items differ to avoid infinite loop
      if (this.selectedRows.length !== parentSelectedRows.length || 
          !this.selectedRows.every(r => parentSelectedRows.includes(r))) {
        this.selectedRows = [...parentSelectedRows];
      }
    }
  }

  onSort(event: any): void {
    if (!this.sortable) return;
    this.sort.emit({ 
      column: event.field, 
      direction: event.order === 1 ? 'asc' : 'desc' 
    });
  }

  onRowSelect(event: any): void {
    if (this.rowDisabled && this.rowDisabled(event.data)) return;
    this.select.emit({ row: event.data, selected: true });
  }

  onRowUnselect(event: any): void {
    this.select.emit({ row: event.data, selected: false });
  }

  onHeaderCheckboxToggle(event: any): void {
    this.selectAllChange.emit(event.checked);
  }

  isRowDisabled(row: any): boolean {
    return this.rowDisabled ? this.rowDisabled(row) : false;
  }

  isRowSelected(row: any): boolean {
    return this.rowSelected ? this.rowSelected(row) : false;
  }

  getRowClass(row: any): string {
    const classes = [];
    if (this.isRowSelected(row)) classes.push('selected-row');
    if (this.isRowDisabled(row)) classes.push('disabled-row');
    return classes.join(' ');
  }

  executeAction(action: TableAction, row: any): void {
    if (action.disabled && action.disabled(row)) return;
    action.action(row);
  }

  isActionDisabled(action: TableAction, row: any): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  getActionLabel(action: TableAction, row: any): string {
    return typeof action.label === 'function' ? action.label(row) : action.label;
  }

  getActionIcon(action: TableAction, row: any): string | undefined {
    return typeof action.icon === 'function' ? action.icon(row) : action.icon;
  }

  getActionVariant(action: TableAction, row: any): string {
    return typeof action.variant === 'function' ? action.variant(row) : (action.variant || 'default');
  }
}
