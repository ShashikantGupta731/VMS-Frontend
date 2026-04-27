import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  textAlign?: 'left' | 'center' | 'right';
  allowHtml?: boolean;
}

export interface TableAction {
  label: string;
  icon?: string;
  action: (row: any) => void;
  disabled?: (row: any) => boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class AppDataTableComponent {
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

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  onSort(column: TableColumn): void {
    if (!column.sortable || !this.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.sort.emit({ column: this.sortColumn, direction: this.sortDirection });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  onRowSelect(row: any, event: Event): void {
    event.stopPropagation();
    if (this.rowDisabled && this.rowDisabled(row)) return;
    
    const selected = !this.rowSelected?.(row);
    this.select.emit({ row, selected });
  }

  onSelectAll(event: Event): void {
    event.stopPropagation();
    this.selectAllChange.emit(!this.selectAll);
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
}
