import { environment } from '@Common';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CheckoutService } from './checkout.service';
import { CheckoutResponse } from '../models/checkout-response.model';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CheckoutService],
    });

    service = TestBed.inject(CheckoutService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('createOrderCheckoutPreferences', () => {
    it('should call GET with correct URL and return CheckoutResponse', () => {
      // Arrange
      const orderId = '123';
      const expectedResponse = {
        id: 'pref_456',
        init_point: 'https://checkout.mercadopago.com',
      } as CheckoutResponse;

      // Act
      service.createOrderCheckoutPreferences(orderId).subscribe((response) => {
        // Assert
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/order/checkout/${orderId}`,
      );
      expect(req.request.method).toBe('GET');

      req.flush(expectedResponse);
    });
  });
});
