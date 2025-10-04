import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CartService } from './cart.service';
import { mockCart, mockCartUpdateProductQuantity } from '../testing';

const baseUrl = 'https://dev-management-portal-be.vercel.app/cart';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [CartService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addProductToCart', () => {
    const url = `${baseUrl}/product/quantity`;
    it('should send a POST request with correct body', () => {
      // Act
      service
        .addProductToCart(mockCartUpdateProductQuantity)
        .subscribe((response) => {
          expect(response).toBeUndefined();
        });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCartUpdateProductQuantity);
      req.flush({});
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const mockError = new ErrorEvent('Network error');

      // Act & Assert
      service.addProductToCart(mockCartUpdateProductQuantity).subscribe({
        next: () => fail('Expected an error, but got a successful response'),
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      req.error(mockError);
    });
  });

  describe('getCart', () => {
    const url = `${baseUrl}`;
    it('should send a GET request and return a Cart', () => {
      // Act
      service.getCart().subscribe((response) => {
        expect(response).toEqual(mockCart);
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(mockCart);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const mockError = new ErrorEvent('Network error');

      // Act & Assert
      service.getCart().subscribe({
        next: () => fail('Expected an error, but got a successful response'),
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.error(mockError);
    });
  });
  describe('deleteCartProduct', () => {
    const url = `${baseUrl}/product`;
    const mockDeleteCartProduct = { productId: 123 };

    it('should send a DELETE request with correct body', () => {
      // Act
      service.deleteCartProduct(mockDeleteCartProduct).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual(mockDeleteCartProduct);
      req.flush({});
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const mockError = new ErrorEvent('Network error');

      // Act & Assert
      service.deleteCartProduct(mockDeleteCartProduct).subscribe({
        next: () => fail('Expected an error, but got a successful response'),
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      req.error(mockError);
    });
  });

  describe('deleteCart', () => {
    const url = `${baseUrl}`;

    it('should send a DELETE request to /cart', () => {
      // Act
      service.deleteCart().subscribe((response) => {
        expect(response).toBeUndefined();
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toBeNull();
      req.flush({});
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const mockError = new ErrorEvent('Network error');

      // Act & Assert
      service.deleteCart().subscribe({
        next: () => fail('Expected an error, but got a successful response'),
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      req.error(mockError);
    });
  });
});
