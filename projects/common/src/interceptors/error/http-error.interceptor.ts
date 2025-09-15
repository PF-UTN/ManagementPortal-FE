import { ErrorModalComponent } from '@Common-UI';

import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { BYPASSED_ERROR_HANDLING_REQUEST_URLS } from './bypassed-requests.constants';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private dialog: MatDialog) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          BYPASSED_ERROR_HANDLING_REQUEST_URLS.some((url) =>
            req.url.includes(url),
          )
        ) {
          return next.handle(req);
        }

        if (error.status === 401 || error.status === 403) {
          return throwError(() => error);
        }

        let message = 'Ocurrió un error de red. Inténtalo de nuevo.';
        if (error.error?.message) {
          message = error.error.message;
        } else if (error.status) {
          message = `Error ${error.status}: ${error.statusText}`;
        }

        this.dialog.open(ErrorModalComponent, {
          data: {
            message,
            stack: error?.error?.stack || JSON.stringify(error, null, 2),
          },
          width: '500px',
        });

        return throwError(() => error);
      }),
    );
  }
}
