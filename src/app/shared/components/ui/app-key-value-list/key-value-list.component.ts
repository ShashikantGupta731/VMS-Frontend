import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface KeyValueItem {
  label: string;
  value: string | number | boolean;
  format?: 'currency' | 'date' | 'text' | 'boolean';
  isMultiline?: boolean;
}

@Component({
  selector: 'app-key-value-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './key-value-list.component.html',
  styleUrl: './key-value-list.component.scss'
})
export class KeyValueListComponent {
  @Input() items: KeyValueItem[] = [];
  @Input() columns: 1 | 2 = 2;
  @Input() labelWidth: string = '200px';
  @Input() sectionTitle?: string;

  formatValue(item: KeyValueItem): string {
    const value = item.value;

    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    switch (item.format) {
      case 'currency':
        return `₹${Number(value).toLocaleString('en-IN')}`;
      case 'date':
        return this.formatDate(value as string);
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  }
}
