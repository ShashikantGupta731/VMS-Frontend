import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs/operators';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  // Inject the LoaderService
  const loaderService = inject(LoaderService);
  
  // Turn on the loader before the request starts
  loaderService.show();
  
  // Handle the request and turn off the loader when it finishes (success or error)
  return next(req).pipe(
    finalize(() => {
      loaderService.hide();
    })
  );
};
