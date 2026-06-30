import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppCardComponent } from '@shared/components/ui/app-card/card.component';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';
import { ApiService } from '@core/services/api';
import { ToastrService } from 'ngx-toastr';
import { AuthLayoutComponent } from '@shared/layouts/auth-layout/auth-layout.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppButtonComponent, AuthLayoutComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = 'http://localhost:5261/api/auth/forgot-password';

  stage: 'username' | 'otp' | 'password' = 'username';
  
  username = '';
  resetToken = '';

  usernameForm = this.fb.group({
    username: ['', Validators.required]
  });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
  });

  passwordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onRequestOtp() {
    if (this.usernameForm.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';
    
    this.username = this.usernameForm.value.username!;

    this.http.post<{message: string}>(`${this.apiUrl}/request-otp`, { username: this.username })
      .subscribe({
        next: (res) => {
          this.successMessage = res.message;
          this.stage = 'otp';
          this.isSubmitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'An error occurred. Please try again.';
          this.isSubmitting = false;
        }
      });
  }

  onVerifyOtp() {
    if (this.otpForm.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const otp = this.otpForm.value.otp!;

    this.http.post<{token: string, message: string}>(`${this.apiUrl}/verify-otp`, { username: this.username, otp })
      .subscribe({
        next: (res) => {
          this.resetToken = res.token;
          this.successMessage = res.message;
          this.stage = 'password';
          this.isSubmitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Invalid or expired OTP.';
          this.isSubmitting = false;
        }
      });
  }

  onResetPassword() {
    if (this.passwordForm.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newPassword = this.passwordForm.value.newPassword!;

    this.http.post<{message: string}>(`${this.apiUrl}/reset`, { resetToken: this.resetToken, newPassword })
      .subscribe({
        next: (res) => {
          this.successMessage = res.message;
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to reset password.';
          this.isSubmitting = false;
        }
      });
  }
}
