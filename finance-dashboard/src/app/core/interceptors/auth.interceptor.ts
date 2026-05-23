import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor:
  HttpInterceptorFn = (req, next) => {
    // DEVELOPMENT MODE: JWT token disabled
    return next(req);

    // const authService = inject(AuthService);
    // const token = authService.getToken();

    // if (token) {
    //   req = req.clone({
    //     setHeaders: { Authorization: `Bearer ${token}` }
    //   });
    // }

    // return next(req).pipe(
    //   catchError(err => {
    //     if (err.status === 401) {
    //       authService.logout();
    //     }
    //     return throwError(() => err);
    //   })
    // );
  };