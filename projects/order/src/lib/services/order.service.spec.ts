import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { OrderService } from './order.service';
import { OrderClientSearchRequest } from '../models/order-client-request-model';
import { OrderClientSearchResponse } from '../models/order-client-response.model';
import { mockOrderClientDetail } from '../testing/mock-data.model';

const url = 'https://dev-management-portal-be.vercel.app/order';
describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    // Arrange

    // Act

    // Assert
    expect(service).toBeTruthy();
  });

  describe('searchClientOrders', () => {
    it('should POST to the correct endpoint and return the response', () => {
      // Arrange
      const requestBody: OrderClientSearchRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: {
          statusName: ['Pending'],
          deliveryMethod: ['Delivery'],
          fromDate: '2024-07-01',
          toDate: '2024-07-31',
        },
        orderBy: {
          field: 'createdAt',
          direction: 'asc',
        },
      };

      const mockResponse: OrderClientSearchResponse = {
        total: 2,
        results: [
          {
            id: 7,
            orderStatusName: 'Pendiente',
            createdAt: '2025-09-22T15:32:28.188Z',
            totalAmount: 201,
            productsCount: 1,
          },
          {
            id: 1,
            orderStatusName: 'Pendiente',
            createdAt: '2025-09-20T11:02:59.042Z',
            totalAmount: 804,
            productsCount: 1,
          },
        ],
      };

      let response: OrderClientSearchResponse | undefined;

      // Act
      service.searchClientOrders(requestBody, null).subscribe((res) => {
        response = res;
      });

      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/order/client/search',
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(requestBody);
      expect(response).toEqual(mockResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const requestBody: OrderClientSearchRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: {},
        orderBy: { field: 'createdAt', direction: 'asc' },
      };

      let errorResponse: unknown;

      // Act
      service.searchClientOrders(requestBody, null).subscribe({
        next: () => {},
        error: (err) => {
          errorResponse = err;
        },
      });

      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/order/client/search',
      );
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      // Assert
      expect(errorResponse).toBeDefined();
      expect((errorResponse as { status: number }).status).toBe(500);
    });
  });

  it('should send Authorization header when token is provided', () => {
    // Arrange
    const requestBody: OrderClientSearchRequest = {
      searchText: 'test',
      page: 1,
      pageSize: 10,
      filters: {},
      orderBy: { field: 'createdAt', direction: 'asc' },
    };
    const token = 'mock-token';
    const mockResponse: OrderClientSearchResponse = {
      total: 1,
      results: [
        {
          id: 1,
          orderStatusName: 'Pendiente',
          createdAt: '2025-09-20T11:02:59.042Z',
          totalAmount: 804,
          productsCount: 1,
        },
      ],
    };
    let response: OrderClientSearchResponse | undefined;

    // Act
    service.searchClientOrders(requestBody, token).subscribe((res) => {
      response = res;
    });

    const req = httpMock.expectOne(
      'https://dev-management-portal-be.vercel.app/order/client/search',
    );
    req.flush(mockResponse);

    // Assert
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(response).toEqual(mockResponse);
  });
  describe('getOrderClientDetail', () => {
    it('should GET to the correct endpoint and return the order detail', () => {
      // Arrange
      let response: typeof mockOrderClientDetail | undefined;

      // Act
      service
        .getOrderClientDetail(mockOrderClientDetail.id)
        .subscribe((res) => {
          response = res;
        });

      const req = httpMock.expectOne(
        `${url}/client/${mockOrderClientDetail.id}`,
      );
      req.flush(mockOrderClientDetail);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(response).toEqual(mockOrderClientDetail);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      let errorResponse: unknown;

      // Act
      service.getOrderClientDetail(mockOrderClientDetail.id).subscribe({
        next: () => {},
        error: (err) => {
          errorResponse = err;
        },
      });

      const req = httpMock.expectOne(
        `${url}/client/${mockOrderClientDetail.id}`,
      );
      req.flush('Error', { status: 404, statusText: 'Not Found' });

      // Assert
      expect(errorResponse).toBeDefined();
      expect((errorResponse as { status: number }).status).toBe(404);
    });
  });
});
