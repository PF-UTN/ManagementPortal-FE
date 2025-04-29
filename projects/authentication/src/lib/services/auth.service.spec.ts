import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {
  mockClient,
  mockUser,
  mockAuthResponse,
} from '../models/mock-data.model';

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

  describe('isAuthenticated()', () => {
    it('should return true when a token exists in localStorage', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');

      const result = service.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token exists in localStorage', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const result = service.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});
