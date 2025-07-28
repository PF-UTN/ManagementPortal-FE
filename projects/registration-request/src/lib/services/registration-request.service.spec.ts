import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RegistrationRequestService } from './registration-request.service';
import { DownloadRegistrationRequestRequest } from '../models/download-registration-request.request';
import { RegistrationRequestParams } from '../models/registration-request-param.model';

describe('RegistrationRequestService', () => {
  let service: RegistrationRequestService;
  let httpMock: HttpTestingController;

  const mockSearchResponse = {
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

  const mockResponse = {
    message: 'Operación realizada con éxito.',
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

  describe('postSearchRegistrationRequest', () => {
    it('should send a POST request with the correct parameters and return data', () => {
      // Arrange
      const params: RegistrationRequestParams = {
        page: 1,
        pageSize: 10,
        searchText: '',
        filters: { status: ['Pending'] },
      };

      // Act
      service.postSearchRegistrationRequest(params).subscribe((response) => {
        // Assert
        expect(response).toEqual(mockSearchResponse);
      });
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/registration-request/search',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockSearchResponse);
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
      service.postSearchRegistrationRequest(params).subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => {
          // Assert
          expect(error.error).toBe(mockError);
        },
      });
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/registration-request/search',
      );
      expect(req.request.method).toBe('POST');
      req.error(mockError);
    });
  });

  describe('postDownloadRegistrationRequest', () => {
    it('should call the correct mocked URL', () => {
      // Arrange
      const params: DownloadRegistrationRequestRequest = {
        searchText: '',
        filters: {},
      };

      // Act
      service.postDownloadRegistrationRequest(params).subscribe();
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/registration-request/download',
      );

      // Assert
      expect(req.request.url).toBe(
        'https://dev-management-portal-be.vercel.app/registration-request/download',
      );
      req.flush(new Blob());
    });

    it('should send the correct request body', () => {
      // Arrange
      const params: DownloadRegistrationRequestRequest = {
        searchText: 'test',
        filters: { status: ['Pending'] },
      };

      // Act
      service.postDownloadRegistrationRequest(params).subscribe();
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/registration-request/download',
      );

      // Assert
      expect(req.request.body).toEqual(params);
      req.flush(new Blob());
    });

    it('should send request with responseType as blob', () => {
      // Arrange
      const params: DownloadRegistrationRequestRequest = {
        searchText: '',
        filters: {},
      };

      // Act
      service.postDownloadRegistrationRequest(params).subscribe();
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/registration-request/download',
      );

      // Assert
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob());
    });

    it('should return HttpResponse<Blob> with the correct body', () => {
      // Arrange
      const params: DownloadRegistrationRequestRequest = {
        searchText: '',
        filters: {},
      };
      const mockBlob = new Blob(['file']);

      // Act
      service.postDownloadRegistrationRequest(params).subscribe((response) => {
        // Assert
        expect(response.body).toEqual(mockBlob);
      });
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/registration-request/download',
      );
      req.flush(mockBlob);
    });

    it('should handle HTTP error correctly', () => {
      // Arrange
      const params: DownloadRegistrationRequestRequest = {
        searchText: '',
        filters: {},
      };
      const mockError = new ErrorEvent('Network error');

      // Act
      service.postDownloadRegistrationRequest(params).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          // Assert
          expect(err.error).toBe(mockError);
        },
      });
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/registration-request/download',
      );
      req.error(mockError);
    });
  });

  describe('approveRegistrationRequest', () => {
    it('should send a POST request to approve a registration request', () => {
      // Arrange
      const id = 1;
      const note = 'Aprobado por el administrador';

      // Act
      service.approveRegistrationRequest(id, note).subscribe((response) => {
        // Assert
        expect(response).toEqual(mockResponse);
      });
      const req = httpMock.expectOne(
        `https://dev-management-portal-be.vercel.app/registration-request/${id}/approve`,
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ note });
      req.flush(mockResponse);
    });
  });

  describe('rejectRegistrationRequest', () => {
    it('should send a POST request to reject a registration request', () => {
      // Arrange
      const id = 1;
      const note = 'Rechazado por falta de documentación';

      // Act
      service.rejectRegistrationRequest(id, note).subscribe((response) => {
        // Assert
        expect(response).toEqual(mockResponse);
      });
      const req = httpMock.expectOne(
        `https://dev-management-portal-be.vercel.app/registration-request/${id}/reject`,
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ note });
      req.flush(mockResponse);
    });
  });
});
