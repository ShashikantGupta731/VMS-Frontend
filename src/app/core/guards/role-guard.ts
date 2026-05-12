import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const roleGuard = (allowedRoles?: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Get roles from argument or from route data
    const roles = allowedRoles || route.data?.['roles'] || [];

    // If no roles required, allow access
    if (roles.length === 0) {
      return true;
    }

    if (authService.hasAnyRole(roles)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};
