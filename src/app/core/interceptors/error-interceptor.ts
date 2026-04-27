import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error) => {
      // Handle different error types
      if (error.status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        toastr.error('Session expired. Please login again.', 'Error');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Forbidden - user doesn't have permission
        toastr.error('You don\'t have permission to access this resource.', 'Access Denied');
      } else if (error.status === 500) {
        // Server error
        toastr.error('Something went wrong. Please try again.', 'Server Error');
      } else if (error.status === 0) {
        // Network error (CORS, offline, etc.)
        toastr.error('Unable to connect to server. Please check your connection.', 'Network Error');
      } else {
        // Other errors
        const errorMessage = error.error?.message || error.message || 'An error occurred';
        toastr.error(errorMessage, 'Error');
      }

      // Return the error to the caller
      return throwError(() => error);
    })
  );
};