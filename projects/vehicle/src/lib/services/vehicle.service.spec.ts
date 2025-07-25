import { environment } from '@Common';

import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { VehicleCreate } from '../models/vehicle-create.model';
import { VehicleParams } from '../models/vehicle-params.model';
import { VehicleService } from '../services/vehicle.service';
import { mockVehicleListItems } from '../testing/mock-data,model';

const baseUrl = environment.apiBaseUrl + '/vehicle';
describe('VehicleService', () => {
  let service: VehicleService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        VehicleService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(VehicleService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('postSearchVehiclesAsync', () => {
    it('should send a POST request with the correct parameters and return data', () => {
      //Arrange
      const params: VehicleParams = {
        page: 1,
        pageSize: 10,
        searchText: 'Patenten01',
      };
      const url = `${baseUrl}/search`;

      //Act & Assert
      service.postSearchVehiclesAsync(params).subscribe((response) => {
        expect(response).toEqual(mockVehicleListItems);
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(params);
      req.flush(mockVehicleListItems);
    });
  });
  it('should handle HTTP errors', () => {
    //Arrange
    const params: VehicleParams = {
      page: 1,
      pageSize: 10,
      searchText: 'Patenten01',
    };
    const mockError = new ErrorEvent('Network error');
    const url = `${baseUrl}/search`;

    //Act
    service.postSearchVehiclesAsync(params).subscribe({
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

  describe('deleteVehicleAsync', () => {
    it('should send a DELETE request with the correct id', () => {
      // Arrange
      const vehicleId = 123;
      const url = `${baseUrl}/${vehicleId}`;

      // Act
      service.deleteVehicleAsync(vehicleId).subscribe((response) => {
        expect(response).toBeNull();
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const vehicleId = 123;
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/${vehicleId}`;

      // Act
      service.deleteVehicleAsync(vehicleId).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      req.error(mockError);
    });
  });

  describe('createVehicleAsync', () => {
    it('should send a POST request with the correct vehicle and return void', () => {
      const vehicle: VehicleCreate = {
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 10000,
        admissionDate: '2025-07-19',
        enabled: true,
        deleted: false,
      };
      const url = `${baseUrl}`;

      service.createVehicleAsync(vehicle).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(vehicle);
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      const vehicle: VehicleCreate = {
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 10000,
        admissionDate: '2025-07-19',
        enabled: true,
        deleted: false,
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}`;

      service.createVehicleAsync(vehicle).subscribe({
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

  describe('updateVehicleAsync', () => {
    it('should send a PUT request with the correct vehicle and return void', () => {
      // Arrange
      const vehicleId = 123;
      const vehicleUpdate = {
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 25000,
        admissionDate: '1990-01-15',
        enabled: true,
      };
      const url = `${baseUrl}/${vehicleId}`;

      // Act && Assert
      service
        .updateVehicleAsync(vehicleId, vehicleUpdate)
        .subscribe((response) => {
          expect(response).toBeUndefined();
        });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(vehicleUpdate);
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const vehicleId = 123;
      const vehicleUpdate = {
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 25000,
        admissionDate: '1990-01-15',
        enabled: true,
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/${vehicleId}`;

      // Act
      service.updateVehicleAsync(vehicleId, vehicleUpdate).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PUT');
      req.error(mockError);
    });
  });
});
