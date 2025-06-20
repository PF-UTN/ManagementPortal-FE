import {
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { Observable, of, throwError } from 'rxjs';

import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let router: Router;
  let next: HttpHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: Router, useValue: mockDeep<Router>() },
      ],
    });

    interceptor = TestBed.inject(AuthInterceptor);
    router = TestBed.inject(Router);
    next = {
      handle: (req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> =>
        of(new HttpResponse(req)),
    };
  });

  describe('intercept', () => {
    it('should add Authorization header when token exists', (done) => {
      // Arrange
      const token = 'test-token';
      localStorage.setItem('token', token);
      const request = new HttpRequest('GET', '/test');
      const expectedRequest = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });

      const handleSpy = jest
        .spyOn(next, 'handle')
        .mockReturnValue(of({} as HttpEvent<unknown>));

      // Act
      interceptor.intercept(request, next).subscribe(() => {
        // Assert
        expect(handleSpy).toHaveBeenCalledWith(expectedRequest);
        done();
      });
    });

    it('should forward original request if token does not exist', (done) => {
      // Arrange
      localStorage.removeItem('token');
      const request = new HttpRequest('GET', '/test');

      const handleSpy = jest
        .spyOn(next, 'handle')
        .mockReturnValue(of({} as HttpEvent<unknown>));

      // Act
      interceptor.intercept(request, next).subscribe(() => {
        // Assert
        expect(handleSpy).toHaveBeenCalledWith(request);
        done();
      });
    });

    it('should navigate to inicio-sesion on 401 error', (done) => {
      // Arrange
      const token = 'test-token';
      localStorage.setItem('token', token);
      const request = new HttpRequest('GET', '/test');
      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
      });

      jest
        .spyOn(next, 'handle')
        .mockReturnValue(throwError(() => errorResponse));

      // Act
      interceptor.intercept(request, next).subscribe({
        error: () => {
          // Assert
          expect(router.navigate).toHaveBeenCalledWith(['autenticacion/inicio-sesion']);
          done();
        },
      });
    });

    it('should remove token from localStorage on 401 error', (done) => {
      // Arrange
      const token = 'test-token';
      localStorage.setItem('token', token);
      const request = new HttpRequest('GET', '/test');
      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
      });

      jest
        .spyOn(next, 'handle')
        .mockReturnValue(throwError(() => errorResponse));

      // Act
      interceptor.intercept(request, next).subscribe({
        error: () => {
          // Assert
          expect(localStorage.getItem('token')).toBeNull();
          done();
        },
      });
    });

    it('should propagate the 401 error', (done) => {
      // Arrange
      const token = 'test-token';
      localStorage.setItem('token', token);
      const request = new HttpRequest('GET', '/test');
      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
      });

      jest
        .spyOn(next, 'handle')
        .mockReturnValue(throwError(() => errorResponse));

      // Act
      interceptor.intercept(request, next).subscribe({
        error: (error) => {
          // Assert
          expect(error).toBe(errorResponse);
          done();
        },
      });
    });

    it('should not navigate on non-401 errors', (done) => {
      // Arrange
      const token = 'test-token';
      localStorage.setItem('token', token);
      const request = new HttpRequest('GET', '/test');
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Server Error',
      });

      jest
        .spyOn(next, 'handle')
        .mockReturnValue(throwError(() => errorResponse));

      // Act
      interceptor.intercept(request, next).subscribe({
        error: () => {
          // Assert
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should keep the token on non-401 errors', (done) => {
      // Arrange
      const token = 'test-token';
      localStorage.setItem('token', token);
      const request = new HttpRequest('GET', '/test');
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Server Error',
      });

      jest
        .spyOn(next, 'handle')
        .mockReturnValue(throwError(() => errorResponse));

      // Act
      interceptor.intercept(request, next).subscribe({
        error: () => {
          // Assert
          expect(localStorage.getItem('token')).toBe(token);
          done();
        },
      });
    });

    it('should propagate non-401 error', (done) => {
      // Arrange
      const token = 'test-token';
      localStorage.setItem('token', token);
      const request = new HttpRequest('GET', '/test');
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Server Error',
      });

      jest
        .spyOn(next, 'handle')
        .mockReturnValue(throwError(() => errorResponse));

      // Act
      interceptor.intercept(request, next).subscribe({
        error: (error) => {
          // Assert
          expect(error).toBe(errorResponse);
          done();
        },
      });
    });
  });
});
