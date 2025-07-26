import {
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { mockDeep } from 'jest-mock-extended';
import { throwError } from 'rxjs';

import { HttpErrorInterceptor } from './http-error.interceptor';

describe('HttpErrorInterceptor', () => {
  let interceptor: HttpErrorInterceptor;
  let dialog: MatDialog;
  let next: HttpHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpErrorInterceptor,
        { provide: MatDialog, useValue: mockDeep<MatDialog>() },
      ],
    });

    interceptor = TestBed.inject(HttpErrorInterceptor);
    dialog = TestBed.inject(MatDialog);
    next = mockDeep<HttpHandler>();
  });

  describe('intercept', () => {
    it('should not open modal for 401 error', (done) => {
      const req = new HttpRequest('GET', '/test');
      const error401 = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
      });
      jest.spyOn(next, 'handle').mockReturnValue(throwError(() => error401));

      interceptor.intercept(req, next).subscribe({
        error: (err) => {
          expect(dialog.open).not.toHaveBeenCalled();
          expect(err.status).toBe(401);
          done();
        },
      });
    });

    it('should not open modal for 403 error', (done) => {
      const req = new HttpRequest('GET', '/test');
      const error403 = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden',
      });
      jest.spyOn(next, 'handle').mockReturnValue(throwError(() => error403));

      interceptor.intercept(req, next).subscribe({
        error: (err) => {
          expect(dialog.open).not.toHaveBeenCalled();
          expect(err.status).toBe(403);
          done();
        },
      });
    });

    it('should open modal for other errors', (done) => {
      const req = new HttpRequest('GET', '/test');
      const error500 = new HttpErrorResponse({
        status: 500,
        statusText: 'Server Error',
        error: { message: 'Test error', stack: 'stacktrace' },
      });
      jest.spyOn(next, 'handle').mockReturnValue(throwError(() => error500));

      interceptor.intercept(req, next).subscribe({
        error: (err) => {
          expect(dialog.open).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              data: expect.objectContaining({
                message: 'Test error',
                stack: 'stacktrace',
              }),
              width: '500px',
            }),
          );
          expect(err.status).toBe(500);
          done();
        },
      });
    });
  });
});
