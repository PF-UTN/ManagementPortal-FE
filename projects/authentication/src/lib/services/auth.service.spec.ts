import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

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
    const mockClient = {
      name: 'Juan',
      lastname: 'Pérez',
      email: 'juan.perez@example.com',
      password: 'password123',
      phone: '123456789',
      birthdate: new Date('1990-01-01'),
      country: 'Argentina',
      province: 'Santa Fe',
      town: 'Rosario',
      street: 'Calle Falsa',
      streetNumber: 123,
      taxCategory: 1,
      taxIdType: 2,
      tax: '20-12345678-9',
      companyName: 'Mi Empresa',
    };
  
    const mockResponse = { token: 'mockJWTToken' };
  
    service.signUpAsync(mockClient).subscribe((response) => {
      expect(response).toEqual(mockResponse); 
    });
  
    const req = httpMock.expectOne('http://localhost:3000/authentication/signup'); 
    expect(req.request.method).toBe('POST'); 
    expect(req.request.body).toEqual(mockClient); 
    req.flush(mockResponse); 
  });

  it('It should perform a POST for logInAsync()', () => {
    const mockUser = {
      email: 'juan.perez@example.com',
      password: 'password123',
    };
  
    const mockResponse = { token: 'mockJWTToken' };
  
    service.logInAsync(mockUser).subscribe((response) => {
      expect(response).toEqual(mockResponse); 
    });
  
    const req = httpMock.expectOne('http://localhost:3000/authentication/signin'); 
    expect(req.request.method).toBe('POST'); 
    expect(req.request.body).toEqual(mockUser); 
    req.flush(mockResponse); 
  });
  
});


