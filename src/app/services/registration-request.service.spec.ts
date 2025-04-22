import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RegistrationRequestService } from './registration-request.service';
import { RegistrationRequestParams } from '../models/registration-request-param.model';

describe('RegistrationRequestService', () => {
  let service: RegistrationRequestService;
  let httpMock: HttpTestingController;

  const mockResponse = {
    total: 2,
    results: [
      {
        id: 1,
        user: {
          fullNameOrBusinessName: 'John Doe',
          email: 'johndoe@example.com',
          documentNumber: '12345678',
          documentType: 'DNI',
          phone: '123456789',
        },
        status: 'Pending',
        requestDate: '2025-03-28T00:00:00Z',
      },
      {
        id: 2,
        user: {
          fullNameOrBusinessName: 'Jane Smith',
          email: 'janesmith@example.com',
          documentNumber: '87654321',
          documentType: 'DNI',
          phone: '987654321',
        },
        status: 'Approved',
        requestDate: '2025-03-27T00:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegistrationRequestService],
    });

    service = TestBed.inject(RegistrationRequestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchRegistrationRequests', () => {
    it('should send a POST request with the correct parameters and return data', () => {
      // Arrange
      const params: RegistrationRequestParams = {
        page: 1,
        pageSize: 10,
        searchText: '',
        filters: { status: ['Pending'] },
      };

      // Act
      service.fetchRegistrationRequests(params).subscribe((response) => {
        // Assert
        expect(response).toEqual(mockResponse);
      });

      // Intercepta la solicitud HTTP
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/registration-request/search',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);

      // Responde con datos simulados
      req.flush(mockResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const params: RegistrationRequestParams = {
        page: 1,
        pageSize: 10,
        searchText: '',
        filters: { status: ['Pending'] },
      };
      const mockError = new ErrorEvent('Network error');

      // Act
      service.fetchRegistrationRequests(params).subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => {
          // Assert
          expect(error.error).toBe(mockError);
        },
      });

      // Intercepta la solicitud HTTP y simula un error
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/registration-request/search',
      );
      expect(req.request.method).toBe('POST');
      req.error(mockError);
    });
  });
});
