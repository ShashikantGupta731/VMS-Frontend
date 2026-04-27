import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'details' | 'edit' | 'transfer';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-btn',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class AppButtonComponent {
  @Input() label: string = '';
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() routerLink?: string;
  @Input() customClass?: string;
  @Input() icon?: string;

  @Output() click = new EventEmitter<void>();

  constructor(private router: Router) {}

  handleClick(event: Event): void {
    if (this.routerLink) {
      this.router.navigate([this.routerLink]);
    } else {
      this.click.emit();
    }
  }

  get buttonClass(): string {
    const classes = ['app-btn'];

    if (this.size !== 'md') {
      classes.push(`btn-${this.size}`);
    }

    if (this.variant !== 'default') {
      classes.push(`btn-${this.variant}`);
    }

    if (this.customClass) {
      classes.push(this.customClass);
    }

    return classes.join(' ');
  }
}
