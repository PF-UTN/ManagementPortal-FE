import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { OrderDirection } from './../../../../common/src/constants/order-direction.enum';
import { PurchaseOrderService } from './purchase-order.service';
import {
  PurchaseOrderOrderField,
  PurchaseOrderParams,
  PurchaseOrder,
} from '../models/purchase-order-param.model';
import {
  mockPurchaseOrderDetail,
  mockPurchaseOrderListItems,
} from '../testing/mock-data.model';

const baseUrl = 'https://dev-management-portal-be.vercel.app/purchase-order';

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        PurchaseOrderService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PurchaseOrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('searchWithFiltersAsync', () => {
    it('should send a POST request with the correct parameters and return data', () => {
      // Arrange
      const params: PurchaseOrderParams = {
        page: 1,
        pageSize: 10,
        searchText: 'Product',
        filters: {
          statusName: ['Pending', 'Ordered'],
          fromEstimatedDeliveryDate: new Date('2023-01-01'),
          toEstimatedDeliveryDate: new Date('2023-12-31'),
          fromDate: new Date('2023-01-01'),
          toDate: new Date('2023-12-31'),
        },
        orderBy: {
          field: PurchaseOrderOrderField.CreatedAt,
          direction: OrderDirection.ASC,
        },
      };
      const url = `${baseUrl}/search`;

      // Act & Assert
      service.searchWithFiltersAsync(params).subscribe((response) => {
        expect(response).toEqual(mockPurchaseOrderListItems);
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockPurchaseOrderListItems);
    });
    it('should handle HTTP errors', () => {
      // Arrange
      const params: PurchaseOrderParams = {
        page: 1,
        pageSize: 10,
        filters: {},
        searchText: '',
        orderBy: {
          field: PurchaseOrderOrderField.CreatedAt,
          direction: OrderDirection.ASC,
        },
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/search`;

      //Act & Assert
      service.searchWithFiltersAsync(params).subscribe({
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
  describe('getPurchaseOrderById', () => {
    it('should send a GET request and return the purchase order detail', () => {
      // Arrange
      const purchaseOrderId = 1;
      const url = `${baseUrl}/${purchaseOrderId}`;

      // Act & Assert
      service.getPurchaseOrderById(purchaseOrderId).subscribe((response) => {
        expect(response).toEqual(mockPurchaseOrderDetail);
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(mockPurchaseOrderDetail);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const purchaseOrderId = 1;
      const url = `${baseUrl}/${purchaseOrderId}`;
      const mockError = new ErrorEvent('Network error');

      // Act & Assert
      service.getPurchaseOrderById(purchaseOrderId).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.error(mockError);
    });
  });

  describe('createPurchaseOrder', () => {
    it('should send a POST request with the correct body and return success', () => {
      // Arrange
      const mockPurchaseOrder: PurchaseOrder = {
        supplierId: 1,
        estimatedDeliveryDate: '1990-01-15',
        observation: 'Purchase order for office supplies',
        purchaseOrderItems: [
          {
            productId: 1,
            quantity: 2,
            unitPrice: 100.5,
          },
        ],
      };
      const url = `${baseUrl}`;

      // Act
      service.createPurchaseOrder(mockPurchaseOrder).subscribe((response) => {
        expect(response).toEqual({});
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPurchaseOrder);
      req.flush({});
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const mockPurchaseOrder: PurchaseOrder = {
        supplierId: 1,
        estimatedDeliveryDate: '1990-01-15',
        observation: 'Purchase order for office supplies',
        purchaseOrderItems: [
          {
            productId: 1,
            quantity: 2,
            unitPrice: 100.5,
          },
        ],
      };
      const url = `${baseUrl}`;
      const mockError = new ErrorEvent('Network error');

      // Act
      service.createPurchaseOrder(mockPurchaseOrder).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      req.error(mockError);
    });
  });
});
