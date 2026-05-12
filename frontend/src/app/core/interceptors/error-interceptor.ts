import { HttpInterceptorFn } from '@angular/common/http';

import {
  catchError,
  throwError
} from 'rxjs';

import { inject } from '@angular/core';

import { Router } from '@angular/router';

export const errorInterceptor:
HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  return next(req).pipe(

    catchError((error) => {

      console.error(
        'HTTP Error:',
        error
      );

      // IMPORTANT
      // DO NOT redirect
      // during login/register requests

      const isAuthRequest =

        req.url.includes('/auth/login') ||

        req.url.includes('/auth/register');

      if (
        error.status === 401 &&
        !isAuthRequest
      ) {

        localStorage.removeItem(
          'inkwell_token'
        );

        localStorage.removeItem(
          'inkwell_user_id'
        );

        router.navigate(['/login']);
      }

      return throwError(
        () => error
      );
    })
  );
};