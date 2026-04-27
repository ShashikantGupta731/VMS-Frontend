import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule,ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  captchaId: string = '';
  captchaImageUrl: string = '';
  isLoadingCaptcha: boolean = false;
  private captchaRetryCount: number = 0;
  private readonly maxRetries: number = 3;

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

  onSubmit(): void {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      this.authService.login(formData.username, formData.password, this.captchaId, formData.captcha).subscribe({
        next: (response) => {
          // Assuming backend returns: { token: string, user: User }
          this.authService.loginSuccess(response.token, response.user);
          const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || this.authService.getRedirectUrl();
          this.router.navigate([returnUrl]);
        },
        error: (error) => {
          // Error is handled by error interceptor
          console.error('Login failed:', error);
          this.refreshCaptcha();
        }
      });
    }
  }

  onGuestLogin(): void {
    // TODO: Implement guest login flow
    // This will open a modal or navigate to guest login page
    console.log('Guest login clicked');
  }
}