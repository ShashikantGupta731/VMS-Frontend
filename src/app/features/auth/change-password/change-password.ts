import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule],
  templateUrl: './change-password.html'
})
export class ChangePasswordComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  changePasswordForm: FormGroup;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$')]
      ],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Getters for form controls
  get f() { return this.changePasswordForm.controls; }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onHide() {
    this.visibleChange.emit(false);
    this.changePasswordForm.reset();
    this.submitted = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.changePasswordForm.invalid) {
      return;
    }

    const { oldPassword, newPassword } = this.changePasswordForm.value;

    this.authService.changePassword(oldPassword, newPassword).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Password changed successfully.';
        this.changePasswordForm.reset();
        this.submitted = false;
        
        // Close modal after 2 seconds on success
        setTimeout(() => {
          this.onHide();
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to change password. Please try again.';
      }
    });
  }
}
