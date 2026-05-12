import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth';

@Component({
  selector: 'app-home-redirect',
  template: '',
  standalone: true
})
export class HomeRedirectComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.authService.getRedirectUrl()]);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
