import { OrderDirection } from '@Common';

import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { OrderService } from './order.service';
import {
  mockOrderDetail,
  mockOrderListItems,
} from '../../models/order/mock-data.model';
import { mockOrderClientDetail } from '../../models/order/mock-data.model2';
import { OrderClientSearchRequest } from '../../models/order/order-client-request-model';
import { OrderClientSearchResponse } from '../../models/order/order-client-response.model';
import { OrderDetail } from '../../models/order/order-detail.model';
import {
  OrderOrderField,
  OrderParams,
} from '../../models/order/order-params.model';
import { OrderSearchRequest } from '../../models/order/order-request-model';

const baseUrl = 'https://dev-management-portal-be.vercel.app/order';

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
  describe('searchOrders', () => {
    it('should POST to /order/search and return the response', () => {
      // Arrange
      const params: OrderSearchRequest = {
        searchText: 'pendiente',
        page: 1,
        pageSize: 5,
        filters: {},
        orderBy: { field: 'createdAt', direction: 'desc' },
      };
      const url = `${baseUrl}/search`;

      // Act & Assert
      service.searchOrders(params).subscribe((response) => {
        expect(response).toEqual(mockOrderListItems);
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockOrderListItems);
    });
    it('should handle HTTP errors', () => {
      // Arrange
      const params: OrderSearchRequest = {
        searchText: 'pendiente',
        page: 1,
        pageSize: 5,
        filters: {},
        orderBy: { field: 'createdAt', direction: 'desc' },
      };
      const url = `${baseUrl}/search`;
      const mockError = new ErrorEvent('Network error');

      //Act & Assert
      service.searchOrders(params).subscribe({
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
  describe('downloadOrderList', () => {
    it('should send a POST request with the correct parameters and return a blob response', () => {
      // Arrange
      const params: OrderParams = {
        page: 1,
        pageSize: 10,
        searchText: 'Order',
        filters: {
          statusName: ['Pending', 'Cancelled'],
          fromCreatedAtDate: '2024-07-01',
          toCreatedAtDate: '2024-07-31',
        },
        orderBy: {
          field: OrderOrderField.CreatedAt,
          direction: OrderDirection.ASC,
        },
      };
      const url = `${baseUrl}/download`;
      const mockBlob = new Blob(['test'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Act & Assert
      service.downloadOrderList(params).subscribe((response) => {
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
      const params: OrderParams = {
        page: 1,
        pageSize: 10,
        filters: {},
        searchText: '',
        orderBy: {
          field: OrderOrderField.CreatedAt,
          direction: OrderDirection.ASC,
        },
      };
      const url = `${baseUrl}/download`;
      const mockError = new ErrorEvent('Network error');

      // Act & Assert
      service.downloadOrderList(params).subscribe({
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
        `${baseUrl}/client/${mockOrderClientDetail.id}`,
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
        `${baseUrl}/client/${mockOrderClientDetail.id}`,
      );
      req.flush('Error', { status: 404, statusText: 'Not Found' });

      // Assert
      expect(errorResponse).toBeDefined();
      expect((errorResponse as { status: number }).status).toBe(404);
    });
  });

  describe('createOrder', () => {
    it('should POST to /order and send the correct payload', () => {
      // Arrange
      const payload = {
        clientId: '1',
        orderStatusId: 1,
        paymentDetail: { paymentTypeId: 1 },
        deliveryMethodId: 1,
        orderItems: [{ productId: 1, quantity: 2, unitPrice: 100.5 }],
      };

      // Act
      service.createOrder(payload).subscribe((response) => {
        expect(response).toEqual({ id: 52 });
      });

      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/order',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ id: 52 });
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const payload = {
        clientId: '1',
        orderStatusId: 1,
        paymentDetail: { paymentTypeId: 1 },
        deliveryMethodId: 1,
        orderItems: [{ productId: 1, quantity: 2, unitPrice: 100.5 }],
      };
      let errorResponse: unknown;

      // Act
      service.createOrder(payload).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (err) => {
          errorResponse = err;
        },
      });

      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/order',
      );
      expect(req.request.method).toBe('POST');
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      // Assert
      expect(errorResponse).toBeDefined();
      expect((errorResponse as { status: number }).status).toBe(500);
    });
  });

  describe('getClient', () => {
    const clientUrl = 'https://dev-management-portal-be.vercel.app/client';
    const mockClient = {
      id: 1,
      address: {
        street: 'Calle Falsa',
        streetNumber: 123,
        town: {
          name: 'Rosario',
          zipCode: '2000',
          province: {
            name: 'Santa Fe',
            country: {
              name: 'Argentina',
            },
          },
        },
      },
    };

    it('should GET to the correct endpoint and return the client', () => {
      let response: typeof mockClient | undefined;

      service.getClient().subscribe((res) => {
        response = res;
      });

      const req = httpMock.expectOne(clientUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBeFalsy();
      req.flush(mockClient);

      expect(response).toEqual(mockClient);
    });

    it('should send Authorization header when token is provided', () => {
      const token = 'mock-token';
      let response: typeof mockClient | undefined;

      service.getClient(token).subscribe((res) => {
        response = res;
      });

      const req = httpMock.expectOne(clientUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush(mockClient);

      expect(response).toEqual(mockClient);
    });

    it('should handle HTTP errors', () => {
      let errorResponse: unknown;

      service.getClient().subscribe({
        next: () => {},
        error: (err) => {
          errorResponse = err;
        },
      });

      const req = httpMock.expectOne(clientUrl);
      req.flush('Error', { status: 401, statusText: 'Unauthorized' });

      expect(errorResponse).toBeDefined();
      expect((errorResponse as { status: number }).status).toBe(401);
    });
  });
  describe('getOrderDetail', () => {
    it('should GET to the correct endpoint and return the order detail', () => {
      // Arrange

      let response: OrderDetail | undefined;
      const orderId = mockOrderDetail.id;

      // Act
      service.getOrderDetail(orderId).subscribe((res) => {
        response = res;
      });

      const req = httpMock.expectOne(`${baseUrl}/${orderId}`);
      req.flush(mockOrderDetail);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(response).toEqual(mockOrderDetail);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const orderId = 1;
      let errorResponse: unknown;

      // Act
      service.getOrderDetail(orderId).subscribe({
        next: () => {},
        error: (err) => {
          errorResponse = err;
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${orderId}`);
      req.flush('Error', { status: 404, statusText: 'Not Found' });

      // Assert
      expect(errorResponse).toBeDefined();
      expect((errorResponse as { status: number }).status).toBe(404);
    });
  });

  describe('createShipment', () => {
    it('should POST to /shipment and send the correct payload', () => {
      // Arrange
      const payload = {
        date: '2024-10-07',
        vehicleId: 1,
        orderIds: [1, 2, 3],
      };
      const url = 'https://dev-management-portal-be.vercel.app/shipment';
      let response: unknown;

      // Act
      service.createShipment(payload).subscribe((res) => {
        response = res;
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(null);

      // Assert
      expect(response).toBeNull();
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const payload = {
        date: '2024-10-07',
        vehicleId: 1,
        orderIds: [1, 2, 3],
      };
      const url = 'https://dev-management-portal-be.vercel.app/shipment';
      let errorResponse: unknown;

      // Act
      service.createShipment(payload).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (err) => {
          errorResponse = err;
        },
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      req.flush('Error', { status: 404, statusText: 'Not Found' });

      // Assert
      expect(errorResponse).toBeDefined();
      expect((errorResponse as { status: number }).status).toBe(404);
    });
  });

  describe('markOrderAsPrepared', () => {
    it('should PATCH to /order/:orderId with correct body', () => {
      // Arrange
      const orderId = 5;
      const orderStatusId = 1;
      let response: unknown;

      // Act
      service.markOrderAsPrepared(orderId, orderStatusId).subscribe((res) => {
        response = res;
      });

      const req = httpMock.expectOne(`${baseUrl}/${orderId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ orderStatusId });

      req.flush(null);

      // Assert
      expect(response).toBeNull();
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const orderId = 5;
      const orderStatusId = 1;
      let errorResponse: unknown;

      // Act
      service.markOrderAsPrepared(orderId, orderStatusId).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (err) => {
          errorResponse = err;
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${orderId}`);
      expect(req.request.method).toBe('PATCH');
      req.flush('Error', { status: 400, statusText: 'Bad Request' });

      // Assert
      expect(errorResponse).toBeDefined();
      expect((errorResponse as { status: number }).status).toBe(400);
    });
  });
});
