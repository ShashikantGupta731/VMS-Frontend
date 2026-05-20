import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownItem {
  label: string;
  value?: any;
  action?: () => void;
  disabled?: boolean;
}

type DropdownSize = 'sm' | 'md' | 'lg' | undefined;

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
})
export class AppDropdownComponent {
  @Input() label: string = '';
  @Input() items: DropdownItem[] = [];
  @Input() buttonClass?: string;
  @Input() menuClass?: string;
  @Input() showArrow: boolean = true;
  @Input() disabled: boolean = false;
  @Input() size: DropdownSize;
  @Input() icon?: string;

  @Output() select = new EventEmitter<DropdownItem>();
  @Output() toggle = new EventEmitter<boolean>();

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  toggleDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      this.toggle.emit(this.isOpen);
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.toggle.emit(false);
  }

  selectItem(item: DropdownItem, event: Event): void {
    event.stopPropagation();
    if (!item.disabled) {
      this.select.emit(item);
      if (item.action) {
        item.action();
      }
      this.closeDropdown();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const toggleButton = this.elementRef.nativeElement.querySelector('.app-dropdown-toggle');
    if (toggleButton && toggleButton.contains(target)) {
      return;
    }
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }
}
