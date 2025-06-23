import { mockSupplier, mockSupplierCreateUpdateResponse } from '@Common';

import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
  let service: SupplierService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        SupplierService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SupplierService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('postCreateUpdateSupplier', () => {
    it('should send a POST request to create or update a supplier', () => {
      // Act & Assert
      service
        .postCreateOrUpdateSupplierAsync(mockSupplier)
        .subscribe((response) => {
          expect(response).toEqual(mockSupplierCreateUpdateResponse);
        });
      const req = httpMock.expectOne(`${service['baseUrl']}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockSupplier);
      req.flush(mockSupplierCreateUpdateResponse);
    });
  });
});
