import { VehicleService } from '@Common';
import { downloadFileFromResponse, VehicleListItem } from '@Common';

import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ShipmentListComponent } from './shipment-list.component';
import {
  ShipmentSearchRequest,
  ShipmentSearchResponse,
} from '../../models/shipment-search.model';
import { ShipmentService } from '../../services/shipment.service';

jest.mock('@Common', () => ({
  ...jest.requireActual('@Common'),
  downloadFileFromResponse: jest.fn(),
}));

describe('ShipmentListComponent', () => {
  let component: ShipmentListComponent;
  let fixture: ComponentFixture<ShipmentListComponent>;
  let shipmentService: jest.Mocked<ShipmentService>;
  let vehicleService: jest.Mocked<VehicleService>;

  const mockShipmentResponse: ShipmentSearchResponse = {
    total: 2,
    results: [
      {
        id: 1,
        date: '2025-10-23T00:00:00.000Z',
        vehicle: {
          id: 12,
          licensePlate: 'AAA111',
          brand: 'Focus',
          model: 'Focus',
        },
        status: 'Pendiente',
        orders: [17],
        estimatedKm: null,
        effectiveKm: null,
        routeLink: null,
      },
      {
        id: 2,
        date: '2025-10-24T00:00:00.000Z',
        vehicle: {
          id: 13,
          licensePlate: 'BBB222',
          brand: 'Fiat',
          model: 'Cronos',
        },
        status: 'Finalizado',
        orders: [18],
        estimatedKm: null,
        effectiveKm: null,
        routeLink: null,
      },
    ],
  };

  beforeEach(async () => {
    shipmentService = {
      searchShipments: jest.fn(),
      downloadShipments: jest.fn(),
    } as unknown as jest.Mocked<ShipmentService>;

    vehicleService = {
      postSearchVehiclesAsync: jest.fn().mockReturnValue(of({ results: [] })),
    } as unknown as jest.Mocked<VehicleService>;

    await TestBed.configureTestingModule({
      imports: [ShipmentListComponent, NoopAnimationsModule],
      providers: [
        { provide: ShipmentService, useValue: shipmentService },
        { provide: VehicleService, useValue: vehicleService },
        DatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch shipments on init and update dataSource$', fakeAsync(() => {
      // Arrange
      shipmentService.searchShipments.mockReturnValue(of(mockShipmentResponse));
      // Act
      component.ngOnInit();
      component.emitSearch();
      tick(400);
      // Assert
      expect(component.dataSource$.value).toEqual(
        mockShipmentResponse.results.map((r) => ({
          id: r.id,
          vehicleAssigned: r.vehicle.licensePlate,
          shipmentStatus: r.status,
          createdAt: r.date,
        })),
      );
      expect(component.itemsNumber).toBe(mockShipmentResponse.total);
      expect(component.isLoading()).toBe(false);
    }));

    it('should handle error and set loading to false', fakeAsync(() => {
      // Arrange
      shipmentService.searchShipments.mockReturnValue(
        throwError(() => new Error('Error')),
      );
      // Act
      component.ngOnInit();
      component.emitSearch();
      tick(400);
      // Assert
      expect(component.isLoading()).toBe(false);
      expect(component.dataSource$.value).toEqual([]);
    }));
  });

  describe('handlePageChange', () => {
    it('should update pageIndex and pageSize and trigger search', () => {
      // Arrange
      const spy = jest.spyOn(component, 'emitSearch');
      const event = { pageIndex: 2, pageSize: 20 };
      // Act
      component.handlePageChange(event);
      // Assert
      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(20);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onApplyDateFilter', () => {
    it('should reset pageIndex and trigger search', () => {
      // Arrange
      const spy = jest.spyOn(component, 'emitSearch');
      component.pageIndex = 5;
      // Act
      component.onApplyDateFilter();
      // Assert
      expect(component.pageIndex).toBe(0);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onClearDateFilter', () => {
    it('should clear dates and trigger search', () => {
      // Arrange
      const spy = jest.spyOn(component, 'emitSearch');
      component.fromDate = new Date();
      component.toDate = new Date();
      // Act
      component.onClearDateFilter();
      // Assert
      expect(component.fromDate).toBeNull();
      expect(component.toDate).toBeNull();
      expect(component.pageIndex).toBe(0);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onSearchTextChange', () => {
    it('should reset pageIndex, set loading and trigger search', () => {
      // Arrange
      const spy = jest.spyOn(component, 'emitSearch');
      component.pageIndex = 3;
      // Act
      component.onSearchTextChange();
      // Assert
      expect(component.pageIndex).toBe(0);
      expect(component.isLoading()).toBe(true);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('clearVehicleSelection', () => {
    it('should clear vehicle selection and trigger search', fakeAsync(() => {
      // Arrange
      const spy = jest.spyOn(component, 'emitSearch');
      component.selectedVehicle = {
        id: 1,
        licensePlate: 'AAA111',
        brand: 'Focus',
        model: 'Focus',
        kmTraveled: 0,
        enabled: true,
        admissionDate: '',
      };
      // Act
      component.clearVehicleSelection();
      tick(400); // espera el debounce si existe
      // Assert
      expect(component.selectedVehicle).toBeNull();
      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('onStatusFilterChange', () => {
    it('should reset pageIndex and trigger search', () => {
      // Arrange
      const spy = jest.spyOn(component, 'emitSearch');
      component.pageIndex = 2;
      // Act
      component.onStatusFilterChange();
      // Assert
      expect(component.pageIndex).toBe(0);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('handleDownloadClick', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call shipmentService.downloadShipments with correct params and trigger file download', () => {
      // Arrange
      const params: ShipmentSearchRequest = component.getSearchRequest();
      const mockBlob = new Blob(['test'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const mockResponse = new HttpResponse({ body: mockBlob, status: 200 });
      shipmentService.downloadShipments.mockReturnValue(of(mockResponse));
      // Act
      component.handleDownloadClick();
      // Assert
      expect(shipmentService.downloadShipments).toHaveBeenCalledWith(params);
      expect(downloadFileFromResponse).toHaveBeenCalledWith(
        mockResponse,
        'envios.xlsx',
      );
    });

    it('should handle errors from shipmentService.downloadShipments', () => {
      // Arrange
      shipmentService.downloadShipments.mockReturnValueOnce(
        throwError(() => new Error('Download error')),
      );
      // Act
      component.handleDownloadClick();
      // Assert
      expect(downloadFileFromResponse).not.toHaveBeenCalled();
    });
  });

  describe('displayVehicle', () => {
    it('should return license plate if vehicle is defined', () => {
      // Arrange
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'XYZ789',
        brand: 'Ford',
        model: 'Focus',
        kmTraveled: 0,
        enabled: true,
        admissionDate: '',
      };
      // Act
      const result = component.displayVehicle(vehicle);
      // Assert
      expect(result).toBe('XYZ789');
    });

    it('should return empty string if vehicle is undefined', () => {
      // Act
      const result = component.displayVehicle(null);
      // Assert
      expect(result).toBe('');
    });
  });
});
