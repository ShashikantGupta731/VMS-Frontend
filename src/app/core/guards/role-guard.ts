import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const roleGuard = (roles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (authService.hasAnyRole(roles)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};
