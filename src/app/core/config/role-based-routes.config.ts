/**
 * Role-Based Routing Configuration
 * Defines redirect URLs based on user roles after login
 */

export interface RoleRouteConfig {
  role: string;
  redirectUrl: string;
}

export const ROLE_BASED_ROUTES: RoleRouteConfig[] = [
  // Admin role - redirect to admin dashboard
  {
    role: 'Admin',
    redirectUrl: '/vehicle'
  },

  // User role - redirect to user dashboard
  {
    role: 'User',
    redirectUrl: '/vehicle'
  },

  // Agent role - redirect to agent dashboard
  {
    role: 'Agent',
    redirectUrl: '/vehicle'
  },

  // Guest role - redirect to guest dashboard
  {
    role: 'Guest',
    redirectUrl: '/vehicle'
  }
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
