import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import * as JwtDecodeModule from 'jwt-decode';

import { AuthService } from './auth.service';
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
});
