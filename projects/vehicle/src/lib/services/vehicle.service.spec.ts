import { environment } from '@Common';

import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MaintenancePerformRequest } from '../models/maintenance-perform.model';
import { MaintenancePlanCreate } from '../models/maintenance-plan-create.model';
import { MaintenanceRepairParams } from '../models/maintenance-repair-param.model';
import { RepairCreate } from '../models/repair-create.model';
import { ServiceSupplierCreateUpdate } from '../models/supplier-create-update.model';
import {
  ServiceSupplierDetailResponse,
  ServiceSupplierResponse,
} from '../models/supplier-response-create-update.model';
import { SupplierSearchResponseModel } from '../models/supplier-search-response-model';
import { VehicleCreate } from '../models/vehicle-create.model';
import { VehicleParams } from '../models/vehicle-params.model';
import { VehicleService } from '../services/vehicle.service';
import { mockVehicleListItems } from '../testing/mock-data.model';

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

  describe('getVehicleById', () => {
    it('should send a GET request with the correct id and return the vehicle', () => {
      // Arrange
      const vehicleId = 123;
      const mockVehicle = {
        id: 123,
        brand: 'Toyota',
        model: 'Corolla',
        licensePlate: 'ABC123',
        enabled: true,
        kmTraveled: 50000,
        admissionDate: '2022-01-01',
      };
      const url = `${baseUrl}/${vehicleId}`;

      // Act & Assert
      service.getVehicleById(vehicleId).subscribe((response) => {
        expect(response).toEqual(mockVehicle);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(mockVehicle);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const vehicleId = 123;
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/${vehicleId}`;

      // Act
      service.getVehicleById(vehicleId).subscribe({
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

  describe('postSearchMaintenanceVehicle', () => {
    it('should send a POST request with the correct vehicleId and params and return data', () => {
      // Arrange
      const vehicleId = 123;
      const params = { searchText: 'aceite', page: 1, pageSize: 10 };
      const mockResponse = { results: [], total: 0 };
      const url = `${baseUrl}/${vehicleId}/maintenance/search`;

      // Act & Assert
      service
        .postSearchMaintenanceVehicle(vehicleId, params)
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const vehicleId = 123;
      const params = { searchText: 'aceite', page: 1, pageSize: 10 };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/${vehicleId}/maintenance/search`;

      // Act
      service.postSearchMaintenanceVehicle(vehicleId, params).subscribe({
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

  describe('postSearchRepairVehicle', () => {
    it('should send a POST request with the correct vehicleId and params and return data', () => {
      // Arrange
      const vehicleId = 123;
      const params = { searchText: 'correa', page: 1, pageSize: 10 };
      const mockResponse = { results: [], total: 0 };
      const url = `${baseUrl}/${vehicleId}/repair/search`;

      // Act & Assert
      service
        .postSearchRepairVehicle(vehicleId, params)
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const vehicleId = 123;
      const params = { searchText: 'correa', page: 1, pageSize: 10 };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/${vehicleId}/repair/search`;

      // Act
      service.postSearchRepairVehicle(vehicleId, params).subscribe({
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

  describe('postSearchMaintenancePlanItemVehicle', () => {
    it('should send a POST request with the correct vehicleId and params and return data', () => {
      // Arrange
      const vehicleId = 123;
      const params = { searchText: 'plan', page: 1, pageSize: 10 };
      const mockResponse = { results: [], total: 0 };
      const url = `${baseUrl}/${vehicleId}/maintenance-plan-item/search`;

      // Act & Assert
      service
        .postSearchMaintenancePlanItemVehicle(vehicleId, params)
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const vehicleId = 123;
      const params = { searchText: 'plan', page: 1, pageSize: 10 };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/${vehicleId}/maintenance-plan-item/search`;

      // Act
      service
        .postSearchMaintenancePlanItemVehicle(vehicleId, params)
        .subscribe({
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

  describe('downloadVehicleList', () => {
    it('should send a POST request with the correct parameters and return a blob response', () => {
      // Arrange
      const params: VehicleParams = {
        page: 1,
        pageSize: 10,
        searchText: 'Patenten01',
      };
      const url = `${baseUrl}/download`;
      const mockBlob = new Blob(['test'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Act & Assert
      service.downloadVehicleList(params).subscribe((response) => {
        expect(response.body).toEqual(mockBlob);
        expect(response.status).toBe(200);
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockBlob, { status: 200, statusText: 'OK' });
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const params: VehicleParams = {
        page: 1,
        pageSize: 10,
        searchText: 'Patenten01',
      };
      const url = `${baseUrl}/download`;
      const mockError = new ErrorEvent('Network error');

      // Act & Assert
      service.downloadVehicleList(params).subscribe({
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

  describe('downloadMaintenanceHistory', () => {
    it('should send a POST request to the correct endpoint and return a blob response', () => {
      // Arrange
      const vehicleId = 2;
      const url = `${baseUrl}/${vehicleId}/maintenance/download`;
      const mockBlob = new Blob(['test'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Act & Assert
      service.downloadMaintenanceHistory(vehicleId).subscribe((response) => {
        expect(response.body).toEqual(mockBlob);
        expect(response.status).toBe(200);
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush(mockBlob, { status: 200, statusText: 'OK' });
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const vehicleId = 2;
      const url = `${baseUrl}/${vehicleId}/maintenance/download`;
      const mockError = new ErrorEvent('Network error');

      // Act & Assert
      service.downloadMaintenanceHistory(vehicleId).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.error(mockError);
    });
  });

  describe('postSearchMaintenanceItem', () => {
    it('should send a POST request with the correct parameters and return data', () => {
      // Arrange
      const params = { searchText: '', page: 1, pageSize: 10 };
      const mockResponse = {
        total: 2,
        results: [
          { id: 1, description: 'Cambio de aceite' },
          { id: 2, description: 'Filtro de aire' },
        ],
      };
      const url = `${baseUrl}/maintenance-item/search`;

      // Act & Assert
      service.postSearchMaintenanceItem(params).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const params = { searchText: '', page: 1, pageSize: 10 };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/maintenance-item/search`;

      // Act
      service.postSearchMaintenanceItem(params).subscribe({
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

  describe('createMaintenancePlanItem', () => {
    it('should send a POST request with the correct payload and return void', () => {
      // Arrange
      const payload: MaintenancePlanCreate = {
        vehicleId: 1,
        maintenanceItemId: 2,
        kmInterval: 10000,
        timeInterval: null,
      };
      const url = `${baseUrl}/maintenance-plan-item`;

      // Act
      service.createMaintenancePlanItem(payload).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const payload: MaintenancePlanCreate = {
        vehicleId: 1,
        maintenanceItemId: 2,
        kmInterval: 10000,
        timeInterval: null,
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/maintenance-plan-item`;

      // Act
      service.createMaintenancePlanItem(payload).subscribe({
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
  describe('postCreateMaintenanceItemAsync', () => {
    it('should send a POST request with the correct payload and return void', () => {
      // Arrange
      const payload = { description: 'Cambio de aceite' };
      const url = `${baseUrl}/maintenance-item`;

      // Act
      service.postCreateMaintenanceItemAsync(payload).subscribe((response) => {
        // Assert
        expect(response).toBeUndefined();
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const payload = { description: 'Cambio de aceite' };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/maintenance-item`;

      // Act
      service.postCreateMaintenanceItemAsync(payload).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          // Assert
          expect(error.error).toBe(mockError);
        },
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      req.error(mockError);
    });
  });

  describe('putUpdateMaintenanceItemAsync', () => {
    it('should send a PUT request with the correct id and payload and return void', () => {
      // Arrange
      const idMaintenanceItem = 10;
      const payload = { description: 'Filtro de aire' };
      const url = `${baseUrl}/maintenance-item/${idMaintenanceItem}`;

      // Act
      service
        .putUpdateMaintenanceItemAsync(idMaintenanceItem, payload)
        .subscribe((response) => {
          // Assert
          expect(response).toBeUndefined();
        });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const idMaintenanceItem = 10;
      const payload = { description: 'Filtro de aire' };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/maintenance-item/${idMaintenanceItem}`;

      // Act
      service
        .putUpdateMaintenanceItemAsync(idMaintenanceItem, payload)
        .subscribe({
          next: () => {
            fail('Expected an error, but got a successful response');
          },
          error: (error) => {
            // Assert
            expect(error.error).toBe(mockError);
          },
        });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PUT');
      req.error(mockError);
    });
  });

  describe('createMaintenanceAsync', () => {
    it('should send a POST request with the correct payload and return void', () => {
      // Arrange
      const vehicleId = 123;
      const payload: MaintenancePerformRequest = {
        date: '2025-10-01',
        kmPerformed: 20000,
        maintenancePlanItemId: 3,
        serviceSupplierId: 2,
      };
      const url = `${baseUrl}/${vehicleId}/maintenance`;

      // Act
      service
        .createMaintenanceAsync(vehicleId, payload)
        .subscribe((response) => {
          // Assert
          expect(response).toBeUndefined();
        });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const vehicleId = 123;
      const payload: MaintenancePerformRequest = {
        date: '2025-10-01',
        kmPerformed: 20000,
        maintenancePlanItemId: 3,
        serviceSupplierId: 2,
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/${vehicleId}/maintenance`;

      // Act
      service.createMaintenanceAsync(vehicleId, payload).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          // Assert
          expect(error.error).toBe(mockError);
        },
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      req.error(mockError);
    });
  });

  describe('searchServiceSuppliers', () => {
    it('should send a POST request with the correct params and return data', () => {
      // Arrange
      const params: MaintenanceRepairParams = {
        page: 1,
        pageSize: 10,
        searchText: 'proveedor',
      };
      const mockResponse: SupplierSearchResponseModel = {
        total: 2,
        results: [
          { id: 1, businessName: 'Proveedor 1' },
          { id: 2, businessName: 'Proveedor 2' },
        ],
      };
      const url = `${environment.apiBaseUrl}/service-supplier/search`;

      // Act
      service.searchServiceSuppliers(params).subscribe((response) => {
        // Assert
        expect(response).toEqual(mockResponse);
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const params: MaintenanceRepairParams = {
        page: 1,
        pageSize: 10,
        searchText: 'proveedor',
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${environment.apiBaseUrl}/service-supplier/search`;

      // Act
      service.searchServiceSuppliers(params).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          // Assert
          expect(error.error).toBe(mockError);
        },
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      req.error(mockError);
    });
  });

  describe('getServiceSupplierByDocument', () => {
    it('should send a GET request with the correct params and return the supplier detail', () => {
      // Arrange
      const documentType = 'DNI';
      const documentNumber = '12345678';
      const mockResponse: ServiceSupplierDetailResponse = {
        id: 9,
        businessName: 'Test',
        documentType: 'DNI',
        documentNumber: '12345678',
        email: 'a@gmail.com',
        phone: '1',
        addressId: 39,
        address: {
          id: 39,
          townId: 102001,
          street: 'es',
          streetNumber: 1,
          town: {
            id: 102001,
            name: 'Buenos Aires',
            zipCode: '1000',
            provinceId: 102,
          },
        },
      };
      const url = `${environment.apiBaseUrl}/service-supplier/search`;

      // Act & Assert
      service
        .getServiceSupplierByDocument(documentType, documentNumber)
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(
        (r) =>
          r.url === url &&
          r.params.get('documentType') === documentType &&
          r.params.get('documentNumber') === documentNumber,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const documentType = 'DNI';
      const documentNumber = '12345678';
      const mockError = new ErrorEvent('Network error');
      const url = `${environment.apiBaseUrl}/service-supplier/search`;

      // Act
      service
        .getServiceSupplierByDocument(documentType, documentNumber)
        .subscribe({
          next: () => {
            fail('Expected an error, but got a successful response');
          },
          error: (error) => {
            expect(error.error).toBe(mockError);
          },
        });

      const req = httpMock.expectOne(
        (r) =>
          r.url === url &&
          r.params.get('documentType') === documentType &&
          r.params.get('documentNumber') === documentNumber,
      );
      expect(req.request.method).toBe('GET');
      req.error(mockError);
    });

    it('should return null if the error status is 404', () => {
      // Arrange
      const documentType = 'DNI';
      const documentNumber = '12345678';
      const url = `${environment.apiBaseUrl}/service-supplier/search`;

      // Act
      service
        .getServiceSupplierByDocument(documentType, documentNumber)
        .subscribe((response) => {
          // Assert
          expect(response).toBeNull();
        });

      const req = httpMock.expectOne(
        (r) =>
          r.url === url &&
          r.params.get('documentType') === documentType &&
          r.params.get('documentNumber') === documentNumber,
      );
      expect(req.request.method).toBe('GET');
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createServiceSupplier', () => {
    it('should send a POST request with the correct payload and return the supplier response', () => {
      // Arrange
      const payload: ServiceSupplierCreateUpdate = {
        businessName: 'Pampa Nutrición',
        documentType: 'DNI',
        documentNumber: '11222333',
        email: 'contacto@pampanutricion.com',
        phone: '+1234567890',
        address: {
          street: 'Calle Falsa',
          streetNumber: 123,
          townId: 1,
        },
      };
      const mockResponse: ServiceSupplierResponse = {
        id: 10,
        businessName: 'Pampa Nutrición',
        documentType: 'DNI',
        documentNumber: '11222333',
        email: 'contacto@pampanutricion.com',
        phone: '+1234567890',
        addressId: 40,
      };
      const url = `${environment.apiBaseUrl}/service-supplier`;

      // Act & Assert
      service.createServiceSupplier(payload).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const payload: ServiceSupplierCreateUpdate = {
        businessName: 'Pampa Nutrición',
        documentType: 'DNI',
        documentNumber: '11222333',
        email: 'contacto@pampanutricion.com',
        phone: '+1234567890',
        address: {
          street: 'Calle Falsa',
          streetNumber: 123,
          townId: 1,
        },
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${environment.apiBaseUrl}/service-supplier`;

      // Act
      service.createServiceSupplier(payload).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          expect(error.error).toBe(mockError);
        },
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.error(mockError);
    });
  });

  describe('updateMaintenancePlanItem', () => {
    it('should send a PUT request with the correct id and payload and return void', () => {
      // Arrange
      const maintenancePlanItemId = 88;
      const payload = {
        maintenanceItemId: 1,
        kmInterval: 10000,
        timeInterval: 6,
      };
      const url = `${baseUrl}/maintenance-plan-item/${maintenancePlanItemId}`;

      // Act
      service
        .updateMaintenancePlanItem(maintenancePlanItemId, payload)
        .subscribe((response) => {
          // Assert
          expect(response).toBeUndefined();
        });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const maintenancePlanItemId = 88;
      const payload = {
        maintenanceItemId: 1,
        kmInterval: 10000,
        timeInterval: 6,
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/maintenance-plan-item/${maintenancePlanItemId}`;

      // Act
      service
        .updateMaintenancePlanItem(maintenancePlanItemId, payload)
        .subscribe({
          next: () => {
            fail('Expected an error, but got a successful response');
          },
          error: (error) => {
            // Assert
            expect(error.error).toBe(mockError);
          },
        });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.error(mockError);
    });
  });

  describe('deleteMaintenancePlanItem', () => {
    it('should send a DELETE request with the correct id and return void', () => {
      // Arrange
      const maintenancePlanItemId = 77;
      const url = `${baseUrl}/maintenance-plan-item/${maintenancePlanItemId}`;

      // Act
      service
        .deleteMaintenancePlanItem(maintenancePlanItemId)
        .subscribe((response) => {
          // Assert
          expect(response).toBeUndefined();
        });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const maintenancePlanItemId = 77;
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/maintenance-plan-item/${maintenancePlanItemId}`;

      // Act
      service.deleteMaintenancePlanItem(maintenancePlanItemId).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          // Assert
          expect(error.error).toBe(mockError);
        },
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      req.error(mockError);
    });
  });

  describe('deleteMaintenanceItem', () => {
    it('should send a DELETE request with the correct id and return void', () => {
      // Arrange
      const maintenanceItem = 77;
      const url = `${baseUrl}/maintenance/${maintenanceItem}`;

      // Act
      service.deleteMaintenanceItem(maintenanceItem).subscribe((response) => {
        // Assert
        expect(response).toBeUndefined();
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const maintenanceItem = 77;
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/maintenance/${maintenanceItem}`;

      // Act
      service.deleteMaintenanceItem(maintenanceItem).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          // Assert
          expect(error.error).toBe(mockError);
        },
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      req.error(mockError);
    });
  });

  describe('updateMaintenance', () => {
    it('should send a PUT request with the correct id and payload and return void', () => {
      // Arrange
      const maintenanceId = 55;
      const payload = {
        date: '2025-11-15',
        kmPerformed: 20500,
        serviceSupplierId: 4,
        maintenancePlanItemId: 99,
      };
      const url = `${baseUrl}/maintenance/${maintenanceId}`;

      // Act
      service
        .updateMaintenance(maintenanceId, payload)
        .subscribe((response) => {
          // Assert
          expect(response).toBeUndefined();
        });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const maintenanceId = 55;
      const payload = {
        date: '2025-11-15',
        kmPerformed: 20500,
        serviceSupplierId: 4,
        maintenancePlanItemId: 99,
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/maintenance/${maintenanceId}`;

      // Act
      service.updateMaintenance(maintenanceId, payload).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          // Assert
          expect(error.error).toBe(mockError);
        },
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.error(mockError);
    });
  });

  describe('getSupplierById', () => {
    it('should send a GET request with the correct id and return the supplier detail', () => {
      // Arrange
      const supplierId = 42;
      const mockResponse: ServiceSupplierDetailResponse = {
        id: 42,
        businessName: 'Proveedor Test',
        documentType: 'CUIT',
        documentNumber: '20-12345678-9',
        email: 'proveedor@test.com',
        phone: '123456789',
        addressId: 1,
        address: {
          id: 1,
          townId: 100,
          street: 'Calle Falsa',
          streetNumber: 123,
          town: {
            id: 100,
            name: 'Ciudad',
            zipCode: '1000',
            provinceId: 1,
          },
        },
      };
      const url = `${environment.apiBaseUrl}/service-supplier/${supplierId}`;

      // Act & Assert
      service.getSupplierById(supplierId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const supplierId = 42;
      const mockError = new ErrorEvent('Network error');
      const url = `${environment.apiBaseUrl}/service-supplier/${supplierId}`;

      // Act
      service.getSupplierById(supplierId).subscribe({
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

  describe('createRepairAsync', () => {
    it('should send a POST request with the correct payload and return void', () => {
      // Arrange
      const vehicleId = 1;
      const payload: RepairCreate = {
        date: '1990-01-15',
        description: 'Puncture',
        kmPerformed: 25000,
        serviceSupplierId: 1,
      };
      const url = `${baseUrl}/${vehicleId}/repair`;

      // Act
      service.createRepairAsync(vehicleId, payload).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const vehicleId = 1;
      const payload: RepairCreate = {
        date: '1990-01-15',
        description: 'Puncture',
        kmPerformed: 25000,
        serviceSupplierId: 1,
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/${vehicleId}/repair`;

      // Act
      service.createRepairAsync(vehicleId, payload).subscribe({
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

  describe('updateRepairAsync', () => {
    it('should send a PUT request with the correct repairId and payload and return void', () => {
      // Arrange
      const repairId = 99;
      const payload: RepairCreate = {
        date: '2025-10-01',
        description: 'Cambio de correa',
        kmPerformed: 30000,
        serviceSupplierId: 5,
      };
      const url = `${baseUrl}/repair/${repairId}`;

      // Act
      service.updateRepairAsync(repairId, payload).subscribe((response) => {
        // Assert
        expect(response).toBeUndefined();
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      // Arrange
      const repairId = 99;
      const payload: RepairCreate = {
        date: '2025-10-01',
        description: 'Cambio de correa',
        kmPerformed: 30000,
        serviceSupplierId: 5,
      };
      const mockError = new ErrorEvent('Network error');
      const url = `${baseUrl}/repair/${repairId}`;

      // Act
      service.updateRepairAsync(repairId, payload).subscribe({
        next: () => {
          fail('Expected an error, but got a successful response');
        },
        error: (error) => {
          // Assert
          expect(error.error).toBe(mockError);
        },
      });

      // Assert
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PUT');
      req.error(mockError);
    });
  });

  describe('deleteRepairAsync', () => {
    it('should send a DELETE request to the correct repairId and return void', () => {
      const repairId = 42;
      const url = `${baseUrl}/repair/${repairId}`;

      service.deleteRepairAsync(repairId).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle HTTP errors', () => {
      const repairId = 42;
      const url = `${baseUrl}/repair/${repairId}`;
      const mockError = new ErrorEvent('Network error');

      service.deleteRepairAsync(repairId).subscribe({
        next: () => fail('Expected error'),
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
