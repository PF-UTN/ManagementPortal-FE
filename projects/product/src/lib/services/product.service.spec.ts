import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductParams } from '../models/product-param.model';
import { ProductService } from '../services/product.service';
import { mockProductListItemResponse } from '../testing/mock-data.model';

const baseUrl = 'https://dev-management-portal-be.vercel.app/product/search';
describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('postSearchProduct', () => {
    it('should send a POST request with the correct parameters and return data', () => {
      // Arrange
      const params: ProductParams = {
        page: 1,
        pageSize: 10,
        searchText: 'Product',
        filters: {
          categoryName: ['Category 1'],
          supplierBusinessName: ['Supplier 1'],
          enabled: true,
        },
      };
      // Act & Assert
      service.postSearchProduct(params).subscribe((response) => {
        expect(response).toEqual(mockProductListItemResponse);
      });
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockProductListItemResponse);
    });
    it('should handle HTTP errors', () => {
      // Arrange
      const params: ProductParams = {
        page: 1,
        pageSize: 10,
      };
      const mockError = new ErrorEvent('Network error');

      //Act & Assert
      service.postSearchProduct(params).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      req.error(mockError);
    });
  });
});
