import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ShipmentService } from './shipment.service';
import {
  ShipmentSearchRequest,
  ShipmentSearchResponse,
  ShipmentSearchFilters,
} from '../models/shipment-search.model';

const baseUrl = 'https://dev-management-portal-be.vercel.app/shipment';

describe('ShipmentService', () => {
  let service: ShipmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ShipmentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ShipmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    // Arrange, Act, Assert
    expect(service).toBeTruthy();
  });

  describe('searchShipments', () => {
    it('should POST to /shipment/search and return the response', () => {
      // Arrange
      const params: ShipmentSearchRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: {
          statusName: ['Pending'],
          fromDate: '2024-07-01',
          toDate: '2024-07-31',
        },
      };
      const mockResponse: ShipmentSearchResponse = {
        total: 2,
        results: [
          {
            id: 1,
            date: '2025-10-23T00:00:00.000Z',
            vehicle: {
              id: 12,
              licensePlate: 'AAA111',
              brand: 'Focus',
              model: 'Focus',
            },
            status: 'Pendiente',
            orders: [17],
            estimatedKm: null,
            effectiveKm: null,
            routeLink: null,
          },
          {
            id: 2,
            date: '2025-10-24T00:00:00.000Z',
            vehicle: {
              id: 13,
              licensePlate: 'BBB222',
              brand: 'Fiat',
              model: 'Cronos',
            },
            status: 'Finalizado',
            orders: [18],
            estimatedKm: null,
            effectiveKm: null,
            routeLink: null,
          },
        ],
      };

      let response: ShipmentSearchResponse | undefined;

      // Act
      service.searchShipments(params).subscribe((res) => {
        response = res;
      });

      const req = httpMock.expectOne(`${baseUrl}/search`);
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      expect(response).toEqual(mockResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const params: ShipmentSearchRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: {},
      };
      let errorResponse: unknown;

      // Act
      service.searchShipments(params).subscribe({
        next: () => {},
        error: (err) => {
          errorResponse = err;
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/search`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      // Assert
      expect(errorResponse).toBeDefined();
      expect((errorResponse as { status: number }).status).toBe(500);
    });
  });

  describe('downloadShipments', () => {
    it('should send a POST request with the correct parameters and return a blob response', () => {
      // Arrange
      const params: { searchText: string; filters?: ShipmentSearchFilters } = {
        searchText: 'Order',
        filters: {
          statusName: ['Pending', 'Shipped'],
          fromDate: '2024-07-01',
          toDate: '2024-07-31',
          vehicleId: 1,
        },
      };
      const url = `${baseUrl}/download`;
      const mockBlob = new Blob(['test'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Act & Assert
      service.downloadShipments(params).subscribe((response) => {
        expect(response.body).toEqual(mockBlob);
        expect(response.status).toBe(200);
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockBlob, { status: 200, statusText: 'OK' });
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const params: { searchText: string; filters?: ShipmentSearchFilters } = {
        searchText: '',
        filters: {},
      };
      const url = `${baseUrl}/download`;
      const mockError = new ErrorEvent('Network error');

      // Act & Assert
      service.downloadShipments(params).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      req.error(mockError);
    });
  });
});
