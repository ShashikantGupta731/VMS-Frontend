import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class AppPaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Input() showInfo: boolean = true;
  @Input() customClass?: string;

  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalItems ? this.totalItems : end;
  }

  get pages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      // Adjust range if at the beginning or end
      if (this.currentPage <= 3) {
        end = 4;
      } else if (this.currentPage >= this.totalPages - 2) {
        start = this.totalPages - 3;
      }
      
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < this.totalPages - 1) pages.push('...');
      
      pages.push(this.totalPages);
    }
    return pages;
  }

  onPageChange(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPrevious(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  onNext(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  goToPageValue: string = '';

  onItemsPerPageChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    if (!isNaN(value)) {
      this.itemsPerPageChange.emit(value);
    }
  }

  onGoToPage(): void {
    const page = parseInt(this.goToPageValue, 10);
    if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
      this.goToPageValue = ''; // Clear after navigating
    }
  }
}
