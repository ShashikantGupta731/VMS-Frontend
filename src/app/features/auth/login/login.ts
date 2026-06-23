import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ButtonModule } from 'primeng/button';
import { AppButtonComponent } from '@shared/components/ui/app-button/button.component';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  authView = signal<'login' | 'guest' | 'otp' | 'reset'>('login');
  showPassword = signal<boolean>(false);

  // Guest & OTP Data
  guestForm: FormGroup;
  otpForm: FormGroup;
  resetForm: FormGroup;

  phone: string = '';
  fullName: string = '';
  otpId: string = '';

  // Captcha & Login Data
  loginForm: FormGroup;
  captchaId: string = '';
  captchaImageUrl: string = '';
  isLoadingCaptcha: boolean = false;
  captchaRetryCount: number = 0;
  maxRetries: number = 3;
  isLoading: boolean = false; // Added missing isLoading signal/property if used in template

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      captcha: ['', [Validators.required]],
      rememberMe: [false]
    });

    this.guestForm = this.fb.group({
      fullName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.resetForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      otp: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  ngOnInit(): void {
    this.loadCaptcha();
  }

  loadCaptcha(): void {
    this.isLoadingCaptcha = true;

    this.http.get(`${environment.apiUrl}/captcha/generate`, {
      responseType: 'arraybuffer',
      observe: 'response'
    }).subscribe({
      next: (response: any) => {
        this.captchaId = response.headers.get('X-Captcha-Id');
        const imageBlob = new Blob([response.body], { type: 'image/png' });
        this.captchaImageUrl = URL.createObjectURL(imageBlob);
        this.isLoadingCaptcha = false;
        this.captchaRetryCount = 0; // Reset retry count on success
        this.cdr.detectChanges(); // Force change detection
      },
      error: (error) => {
        console.error('Failed to load captcha:', error);
        this.isLoadingCaptcha = false;

        // Retry after 2 seconds if backend might not be ready
        if (this.captchaRetryCount < this.maxRetries) {
          this.captchaRetryCount++;
          setTimeout(() => {
            this.loadCaptcha();
          }, 2000);
        }
      }
    });
  }

  refreshCaptcha(): void {
    this.loginForm.patchValue({ captcha: '' });
    this.loadCaptcha();
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(): void {
    const rawForm = this.loginForm.getRawValue();
    console.log('--- LOGIN FLOW START ---');
    console.log('1. LoginComponent.onSubmit: Raw Form Data:', JSON.stringify({ ...rawForm, password: '***' }));
    console.log('2. LoginComponent.onSubmit: Captcha ID:', this.captchaId);
    console.log('3. LoginComponent.onSubmit: Form Validity:', this.loginForm.valid);

    if (this.loginForm.valid) {
      console.log('4. LoginComponent.onSubmit: Calling AuthService.login...');
      this.authService.login(rawForm.username, rawForm.password, this.captchaId, rawForm.captcha).subscribe({
        next: (response) => {
          console.log('9. LoginComponent: SUCCESS response received from API:', JSON.stringify(response));
          this.authService.loginSuccess(response.token, response.user);
          const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || this.authService.getRedirectUrl();
          console.log('10. LoginComponent: Login flow complete. Navigating to:', returnUrl);
          this.router.navigate([returnUrl]);
        },
        error: (error) => {
          console.error('9. LoginComponent: ERROR response received from API:', error);
          this.refreshCaptcha();
        }
      });
    } else {
      console.warn('4. LoginComponent.onSubmit: ABORTED - Form is invalid');
    }
  }

  onGuestLogin(): void {
    this.authView.set('guest');
  }

  showLogin(): void {
    this.authView.set('login');
    this.loadCaptcha();
  }

  showResetPassword(): void {
    this.authView.set('reset');
  }

  getOtp(): void {
    if (this.guestForm.valid) {
      const { fullName, phone } = this.guestForm.value;
      this.fullName = fullName;
      this.phone = phone;

      this.authService.requestGuestOtp(fullName, phone).subscribe({
        next: (res) => {
          console.log('OTP Request Success:', res);
          this.authView.set('otp');
        },
        error: (err) => {
          console.error('OTP Request Failed:', err);
        }
      });
    }
  }

  onVerifyOtp(): void {
    if (this.otpForm.valid) {
      const { otp } = this.otpForm.value;
      this.authService.verifyGuestOtp(this.phone, otp).subscribe({
        next: (response) => {
          this.authService.loginSuccess(response.token, response.user);
          const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || this.authService.getRedirectUrl();
          this.router.navigate([returnUrl]);
        },
        error: (err) => {
          console.error('OTP Verification Failed:', err);
        }
      });
    }
  }

  onResetSubmit(): void {
    if (this.resetForm.valid) {
      const { phone, otp, newPassword } = this.resetForm.value;
      this.authService.resetPassword(phone, otp, newPassword).subscribe({
        next: (res) => {
          this.showLogin();
        },
        error: (err) => {
          console.error('Reset Failed:', err);
        }
      });
    }
  }
}