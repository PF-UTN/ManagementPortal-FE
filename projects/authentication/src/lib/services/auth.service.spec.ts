import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { mockClient, mockUser, mockAuthResponse } from '../models/mock-data.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
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

  it('It should perform a POST for signUpAsync()', () => {
  
  
    service.signUpAsync(mockClient).subscribe((response) => {
      expect(response).toEqual(mockAuthResponse); 
    });
  
    const req = httpMock.expectOne('https://dev-management-portal-be.vercel.app/authentication/signup'); 
    expect(req.request.method).toBe('POST'); 
    expect(req.request.body).toEqual(mockClient); 
    req.flush(mockAuthResponse); 
  });

  it('It should perform a POST for logInAsync()', () => {
    
  
    service.logInAsync(mockUser).subscribe((response) => {
      expect(response).toEqual(mockAuthResponse); 
    });
  
    const req = httpMock.expectOne('https://dev-management-portal-be.vercel.app/authentication/signin'); 
    expect(req.request.method).toBe('POST'); 
    expect(req.request.body).toEqual(mockUser); 
    req.flush(mockAuthResponse); 
  });
  
});


