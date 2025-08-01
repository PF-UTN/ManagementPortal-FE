import {
  HttpRequest,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor {
  constructor(private readonly router: Router) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');

    const authReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.router.navigate(['autenticacion/inicio-sesion']);
          localStorage.removeItem('token');
        }

        if (error.status === 403) {
          this.router.navigate(['unauthorized']);
        }
        return throwError(() => error);
      }),
    );
  }
}
