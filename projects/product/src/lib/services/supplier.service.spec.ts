import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SupplierService } from './supplier.service';
import { SupplierResponse } from '../models/supplier-response.model';

describe('SupplierService', () => {
  let service: SupplierService;
  let httpMock: HttpTestingController;

  const mockSuppliers: SupplierResponse[] = [
    {
      id: 1,
      businessName: 'Supplier 1',
      documentType: 'CUIT',
      documentNumber: '20-12345678-9',
      email: 'supplier1@mail.com',
      phone: '123456789',
      addressId: 1,
    },
    {
      id: 2,
      businessName: 'Supplier 2',
      documentType: 'CUIT',
      documentNumber: '20-87654321-0',
      email: 'supplier2@mail.com',
      phone: '987654321',
      addressId: 1,
    },
  ];

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

  describe('Service creation', () => {
    it('should create the service', () => {
      // act
      const created = service;
      // assert
      expect(created).toBeTruthy();
    });
  });

  describe('getSuppliers', () => {
    it('should perform GET and return an array of suppliers', () => {
      // act
      let result: SupplierResponse[] = [];
      service.getSuppliers().subscribe((suppliers) => {
        result = suppliers;
        // assert
        expect(result.length).toBe(2);
        expect(result).toEqual(mockSuppliers);
      });

      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/supplier',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSuppliers);
    });

    it('should handle empty array', () => {
      // act
      let result: SupplierResponse[] = [];
      service.getSuppliers().subscribe((suppliers) => {
        result = suppliers;
        // assert
        expect(result.length).toBe(0);
        expect(result).toEqual([]);
      });

      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/supplier',
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should propagate HTTP errors', () => {
      // arrange
      const errorMsg = 'Network error';
      // act & assert
      service.getSuppliers().subscribe({
        next: () => fail('Request should fail'),
        error: (error: { status: number; statusText: string }) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Server Error');
        },
      });

      const req = httpMock.expectOne(
        'https://dev-management-portal-be.vercel.app/supplier',
      );
      expect(req.request.method).toBe('GET');
      req.flush(errorMsg, { status: 500, statusText: 'Server Error' });
    });
  });
});
