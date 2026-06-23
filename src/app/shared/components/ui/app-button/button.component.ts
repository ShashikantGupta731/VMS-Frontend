import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

// Restored all your custom button variants!
type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'details' | 'edit' | 'transfer' | 'outline' | 'outline-primary' | 'outline-secondary' | 'dark-blue';
type ButtonSize = 'sm' | 'md' | 'lg' | undefined;

@Component({
  selector: 'app-btn',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AppButtonComponent {
  @Input() label: string = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize;
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() isLoading: boolean = false; // Alias for consistency
  @Input() routerLink?: string;
  @Input() customClass?: string;
  @Input() icon?: string;

  constructor(private router: Router) { }

  handleClick(event: Event): void {
    if (this.routerLink) {
      this.router.navigate([this.routerLink]);
    }
    // Native DOM 'click' events automatically bubble up to the <app-btn> host element.
    // Emitting a custom @Output() named 'click' causes parent handlers to fire twice!
  }

  // Maps your custom variants to PrimeNG's official severities
  get primeSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | undefined {
    switch (this.variant) {
      case 'warning': return 'warn';
      case 'edit': return 'warn';
      case 'danger': return 'danger';
      case 'success': return 'success';
      case 'info': return 'info';
      case 'details': return 'info';
      case 'secondary': return 'secondary';
      case 'default': return 'secondary';
      case 'transfer': return 'help';
      case 'primary': return 'primary';
      case 'outline-primary': return 'primary';
      case 'outline-secondary': return 'secondary';
      case 'dark-blue': return 'contrast';
      default: return undefined;
    }
  }

  // Maps your custom sizes to PrimeNG's sizes
  get primeSize(): 'small' | 'large' | undefined {
    if (this.size === 'sm') return 'small';
    if (this.size === 'lg') return 'large';
    return undefined;
  }

  get isOutlined(): boolean {
    return this.variant === 'outline' || this.variant === 'outline-primary' || this.variant === 'outline-secondary';
  }
}
