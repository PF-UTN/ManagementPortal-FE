import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductCategoryResponse } from '../models/product-category-response.model';
import { ProductCreate } from '../models/product-create-param.model';
import { ProductResponse } from '../models/product-create-response.model';
import { ProductParams } from '../models/product-param.model';
import { ProductService } from '../services/product.service';
import {
  mockProductListItemResponse,
  mockProductCreate,
  mockProductResponse,
  mockProductCategories,
  mockProductDetail,
} from '../testing/mock-data.model';

const baseUrl = 'https://dev-management-portal-be.vercel.app/product';
let productId: number;
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
      const url = `${baseUrl}/search`;

      // Act & Assert
      service.postSearchProduct(params).subscribe((response) => {
        expect(response).toEqual(mockProductListItemResponse);
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockProductListItemResponse);
    });
    it('should handle HTTP errors', () => {
      // Arrange
      const params: ProductParams = {
        page: 1,
        pageSize: 10,
        filters: {},
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/search`;

      //Act & Assert
      service.postSearchProduct(params).subscribe({
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

  describe('getProductById', () => {
    it('should send a GET request with the correct parameters and return data', () => {
      //Arrange
      productId = 1;
      const url = `${baseUrl}/${productId}`;
      //Act
      service.getProductById(productId).subscribe((product) => {
        //Assert
        expect(product).toEqual(mockProductDetail);
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(mockProductDetail);
    });
  });

  describe('createProduct', () => {
    it('should send a POST request with the correct parameters and return data', () => {
      // Arrange
      const params: ProductCreate = mockProductCreate;
      const expectedResponse: ProductResponse = mockProductResponse;
      // Act & Assert
      service.createProduct(params).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/product',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(expectedResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const params: ProductCreate = mockProductCreate;
      const mockError = new ErrorEvent('Network error');
      // Act & Assert
      service.createProduct(params).subscribe({
        next: () => fail('Expected an error, but got a successful response'),
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/product',
      );
      expect(req.request.method).toBe('POST');
      req.error(mockError);
    });
  });

  describe('getCategories', () => {
    it('should send a GET request and return an array of categories', () => {
      // Arrange
      const expectedResponse: ProductCategoryResponse[] = mockProductCategories;
      // Act & Assert
      service.getCategories().subscribe((categories) => {
        expect(categories).toEqual(expectedResponse);
      });
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/product-categories',
      );
      expect(req.request.method).toBe('GET');
      req.flush(expectedResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const mockError = new ErrorEvent('Network error');
      // Act & Assert
      service.getCategories().subscribe({
        next: () => fail('Expected an error, but got a successful response'),
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/product-categories',
      );
      expect(req.request.method).toBe('GET');
      req.error(mockError);
    });
  });
});
