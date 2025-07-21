import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductCategoryService } from './product-category.service';
import { mockProductCategory } from '../testing/mock-data.model';

describe('ProductCategoryService', () => {
  let service: ProductCategoryService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        ProductCategoryService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProductCategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('postCreateOrUpdateProductCategoryAsync', () => {
    it('should call POST and return ProductCategoryResponse on postCreateOrUpdateProductCategoryAsync', () => {
      // Arrange & Act
      service
        .postCreateOrUpdateProductCategoryAsync(mockProductCategory)
        .subscribe((res) => {
          // Assert
          expect(res).toEqual(mockProductCategory);
        });
      // Arrange & Act
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/product-category/',
      );
      // Assert
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockProductCategory);
      req.flush(mockProductCategory);
    });
  });
  describe('getCategoriesAsync', () => {
    it('should call GET and return ProductCategoryResponse[] on getCategoriesAsync', () => {
      // Arrange & Act
      service.getCategoriesAsync().subscribe((res) => {
        // Assert
        expect(res).toEqual([mockProductCategory]);
      });
      // Arrange & Act
      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/product-category/',
      );
      // Assert
      expect(req.request.method).toBe('GET');
      req.flush([mockProductCategory]);
    });
  });
});
