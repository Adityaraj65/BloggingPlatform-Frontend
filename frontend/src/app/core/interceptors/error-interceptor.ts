import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error) => {
      console.error('HTTP Error:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        error: error.error
      });
      
      // Handle 401 Unauthorized - redirect to login only for profile fetch
      if (error.status === 401 && req.url.includes('/profile/')) {
        localStorage.removeItem('inkwell_token');
        localStorage.removeItem('inkwell_user_id');
        router.navigate(['/login']);
      }
      
      // Handle 403 Forbidden
      if (error.status === 403) {
        console.warn('Access forbidden');
      }
      
      // Handle 5xx Server errors
      if (error.status >= 500) {
        console.error('Server error occurred');
      }
      
      // Always re-throw the error so components can handle it
      return throwError(() => error);
    })
  );
};
