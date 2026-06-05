import { Injectable, signal } from '@angular/core';
import { Observable, timer, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api';
import { ToastrService } from 'ngx-toastr';
import { getRedirectUrlByRole } from '../config/role-based-routes.config';

// User interface
export interface User {
  id: number;
  username: string;
  name: string;
  phone: string;
  roles: string[];
  isGuest: boolean;
  ddoCode?: string;       // IFMS-formatted Drawing & Disbursing Officer code (e.g. CHD00/0135)
  tokenExpiry?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public currentUser = signal<User | null>(null);

  private idleTimer: Subscription | null = null;
  private readonly IDLE_TIMEOUT = 120 * 60 * 1000; // 30 minutes in milliseconds
  private readonly TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // 5 minutes in milliseconds

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Check for existing token on app load
    this.loadUserFromStorage();
    // Start idle timeout tracking
    this.startIdleTracking();
  }

  // Get current user value
  get currentUserValue(): User | null {
    return this.currentUser();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const user = this.currentUserValue;
    if (!user) return false;

    // Check if token is expired
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      if (Date.now() > expiryTime) {
        this.clearSession();
        return false;
      }
    }

    return true;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    return user.roles.includes(role);
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    return roles.some(role => user.roles.includes(role));
  }

  // Login with username and password
  login(username: string, password: string, captchaId?: string, captchaInput?: string): Observable<any> {
    console.log('5. AuthService.login: Preparing payload', { username, captchaId, captchaInput });
    return this.apiService.post<any>('/auth/login', {
      Username: username,
      Password: password,
      CaptchaId: captchaId,
      CaptchaInput: captchaInput
    });
  }

  // Request OTP for guest login
  requestGuestOtp(name: string, phone: string): Observable<any> {
    return this.apiService.post<any>('/auth/guest-login', { name, phone });
  }

  // Verify OTP and complete guest login
  verifyGuestOtp(phone: string, otp: string): Observable<any> {
    return this.apiService.post<any>('/auth/verify-otp', { phone, otp });
  }

  // Reset password with OTP
  resetPassword(phone: string, otp: string, newPassword: string): Observable<any> {
    return this.apiService.post<any>('/auth/reset-password', { phone, otp, newPassword });
  }

  // Handle successful login
  loginSuccess(token: string, user: User): void {
    const tokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_info', JSON.stringify(user));
    localStorage.setItem('token_expiry', tokenExpiry.toString());
    this.currentUser.set(user);
    this.resetIdleTimer();
  }

  // Get redirect URL based on user roles
  getRedirectUrl(): string {
    const user = this.currentUserValue;
    if (!user || !user.roles || user.roles.length === 0) {
      return '/vehicle'; // Default redirect
    }
    return getRedirectUrlByRole(user.roles);
  }

  // Logout
  logout(): void {
    // Call backend logout endpoint
    this.apiService.post<any>('/auth/logout', {}).subscribe({
      next: () => {
        this.clearSession();
      },
      error: () => {
        // Even if backend call fails, clear session on client side
        this.clearSession();
      }
    });
  }

  // Clear session and redirect
  private clearSession(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('token_expiry');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // Load user from localStorage on app init
  private loadUserFromStorage(): void {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        const user: User = JSON.parse(userInfo);
        this.currentUser.set(user);
      } catch (e) {
        console.error('Error parsing user info:', e);
        this.clearSession();
      }
    }
  }

  // Idle timeout tracking
  private startIdleTracking(): void {
    this.resetIdleTimer();

    // Track user activity
    window.addEventListener('mousemove', () => this.resetIdleTimer());
    window.addEventListener('keydown', () => this.resetIdleTimer());
    window.addEventListener('scroll', () => this.resetIdleTimer());
    window.addEventListener('click', () => this.resetIdleTimer());
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) {
      this.idleTimer.unsubscribe();
    }

    this.idleTimer = timer(this.IDLE_TIMEOUT).subscribe(() => {
      if (this.isAuthenticated()) {
        this.toastr.warning('You have been logged out due to inactivity.', 'Session Timeout');
        this.clearSession();
      }
    });
  }

  // Check if token needs refresh
  shouldRefreshToken(): boolean {
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (!tokenExpiry) return false;

    const expiryTime = parseInt(tokenExpiry);
    const timeUntilExpiry = expiryTime - Date.now();

    return timeUntilExpiry < this.TOKEN_REFRESH_THRESHOLD;
  }

  // Cleanup on destroy
  destroy(): void {
    if (this.idleTimer) {
      this.idleTimer.unsubscribe();
    }
  }
}