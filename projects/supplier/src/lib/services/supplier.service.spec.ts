import { mockSupplier, mockSupplierCreateUpdateResponse } from '@Common';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
  let service: SupplierService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SupplierService],
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

  it('should send a POST request to create or update a supplier', () => {
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
