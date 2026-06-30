/**
 * Role-Based Routing Configuration
 * Defines redirect URLs based on user roles after login
 */

export interface RoleRouteConfig {
  role: string;
  redirectUrl: string;
}

export const ROLE_BASED_ROUTES: RoleRouteConfig[] = [
  { role: 'DDO', redirectUrl: '/dashboard' },
  { role: 'ADMN', redirectUrl: '/dashboard' },
  { role: 'NDOF', redirectUrl: '/claim-verification' },
  { role: 'SEC', redirectUrl: '/reports' },
  { role: 'HOD', redirectUrl: '/user-management' },
  { role: 'DCL', redirectUrl: '/dashboard' },
  { role: 'FD', redirectUrl: '/dashboard' },
  { role: 'PPOF', redirectUrl: '/ppo' },
  { role: 'GUEST', redirectUrl: '/guest-report' },
  { role: 'ROFC', redirectUrl: '/dashboard' }
];

/**
 * Get redirect URL based on user's roles
 * @param userRoles - Array of role names assigned to the user
 * @returns The redirect URL based on the first matching role, or default URL
 */
export function getRedirectUrlByRole(userRoles: string[]): string {
  if (!userRoles || userRoles.length === 0) {
    // If no roles, redirect to default dashboard
    return '/vehicle';
  }

  for (const role of userRoles) {
    const routeConfig = ROLE_BASED_ROUTES.find(config => config.role === role);
    if (routeConfig) {
      return routeConfig.redirectUrl;
    }
  }

  // If no matching role found, redirect to default dashboard
  return '/vehicle';
}

/**
 * Get default redirect URL (used when no specific role matches)
 */
export const DEFAULT_REDIRECT_URL = '/vehicle';
