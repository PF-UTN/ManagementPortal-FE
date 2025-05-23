import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import * as JwtDecodeModule from 'jwt-decode';

import { AuthService } from './auth.service';
import { RoleHierarchy } from '../../constants';
import {
  mockClient,
  mockUser,
  mockAuthResponse,
} from '../../testing/mock-data.model';

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockDeep<Router>() },
      ],
    });
    service = TestBed.inject(AuthService);

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    const localStorageMock = mockDeep<Storage>();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('logOut', () => {
    it('should remove token from localStorage', () => {
      // Arrange
      const removeItemSpy = jest.spyOn(localStorage, 'removeItem');
      localStorage.setItem('token', 'mockToken');

      // Act
      service.logOut();

      // Assert
      expect(removeItemSpy).toHaveBeenCalledWith('token');
    });

    it('should navigate to login', () => {
      // Arrange
      const navigateSpy = jest.spyOn(router, 'navigate');

      // Act
      service.logOut();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['autenticacion/login']);
    });
  });

  it('should perform a POST for signUpAsync()', () => {
    service.signUpAsync(mockClient).subscribe((response) => {
      expect(response).toEqual(mockAuthResponse);
    });
    const req = httpMock.expectOne(
      'https://dev-management-portal-be.vercel.app/authentication/signup',
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockClient);
    req.flush(mockAuthResponse);
  });

  it('should perform a POST for logInAsync()', () => {
    service.logInAsync(mockUser).subscribe((response) => {
      expect(response).toEqual(mockAuthResponse);
    });
    const req = httpMock.expectOne(
      'https://dev-management-portal-be.vercel.app/authentication/signin',
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockAuthResponse);
  });

  it('should set userRole after signUpAsync()', () => {
    // Arrange
    const mockDecodedToken = { role: 'admin' };
    jest.spyOn(JwtDecodeModule, 'jwtDecode').mockReturnValue(mockDecodedToken);

    // Act
    service.signUpAsync(mockClient).subscribe(() => {
      // Assert
      expect(service.userRole).toBe(mockDecodedToken.role);
    });

    const req = httpMock.expectOne(
      'https://dev-management-portal-be.vercel.app/authentication/signup',
    );

    req.flush(mockAuthResponse);
  });

  describe('hasAccess', () => {
    beforeEach(() => {
      Object.assign(RoleHierarchy, {
        admin: ['admin', 'user', 'guest'],
        guest: ['guest'],
      });
    });

    it('should return true if allowedRoles is empty', () => {
      // Arrange
      const allowedRoles: string[] = [];

      // Act
      const result = service.hasAccess(allowedRoles);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user has not set user role', () => {
      // Arrange
      const allowedRoles = ['admin', 'user'];

      // Act
      const result = service.hasAccess(allowedRoles);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true if user has access to the allowed roles', () => {
      // Arrange
      service.userRole = 'admin';
      const allowedRoles = ['admin', 'user'];

      // Act
      const result = service.hasAccess(allowedRoles);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user does not have access to the allowed roles', () => {
      // Arrange
      service.userRole = 'guest';
      const allowedRoles = ['admin', 'user'];

      // Act
      const result = service.hasAccess(allowedRoles);

      // Assert
      expect(result).toBe(false);
    });
  });
});
