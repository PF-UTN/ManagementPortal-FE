import { environment } from '@Common';

import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { VehicleParams } from '../models/vehicle-params.model';
import { VehicleService } from '../services/vehicle.service';
import { mockVehicleListItems } from '../testing/mock-data,model';

const baseUrl = environment.apiBaseUrl + '/vehicles';
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
});
