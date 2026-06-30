import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs/operators';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  
  // Check if this request should bypass the global loader
  if (req.headers.has('X-Skip-Loader')) {
    const clonedReq = req.clone({ headers: req.headers.delete('X-Skip-Loader') });
    return next(clonedReq);
  }
  
  loaderService.show();
  
  return next(req).pipe(
    finalize(() => {
      loaderService.hide();
    })
  );
};
