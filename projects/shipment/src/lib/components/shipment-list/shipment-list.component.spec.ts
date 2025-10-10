import {
  VehicleService,
  downloadFileFromResponse,
  VehicleListItem,
} from '@Common';
import { LateralDrawerService } from '@Common-UI';

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
import { ShipmentItem } from '../../models/shipment-item.model';
import {
  ShipmentSearchRequest,
  ShipmentSearchResponse,
} from '../../models/shipment-search.model';
import { ShipmentStatusOptions } from '../../models/shipment-status.enum';
import { ShipmentService } from '../../services/shipment.service';
import { ShipmentDetailDrawerComponent } from '../shipment-detail-drawer/shipment-detail-drawer.component';

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

  describe('columns', () => {
    it('should return correct id value', () => {
      // Arrange
      const item: ShipmentItem = {
        id: 123,
        vehicleAssigned: 'AAA111',
        shipmentStatus: ShipmentStatusOptions.Pending,
        createdAt: '2025-10-23T00:00:00.000Z',
      };
      // Act
      const idValue = component.columns[0]?.value?.(item);
      // Assert
      expect(idValue).toBe('123');
    });

    it('should return correct vehicleAssigned value', () => {
      // Arrange
      const item: ShipmentItem = {
        id: 123,
        vehicleAssigned: 'AAA111',
        shipmentStatus: ShipmentStatusOptions.Pending,
        createdAt: '2025-10-23T00:00:00.000Z',
      };
      // Act
      const vehicleValue = component.columns[1]?.value?.(item);
      // Assert
      expect(vehicleValue).toBe('AAA111');
    });

    it('should return correct shipmentStatus value', () => {
      // Arrange
      const item: ShipmentItem = {
        id: 123,
        vehicleAssigned: 'AAA111',
        shipmentStatus: ShipmentStatusOptions.Pending,
        createdAt: '2025-10-23T00:00:00.000Z',
      };
      // Act
      const statusValue = component.columns[2]?.value?.(item);
      // Assert
      expect(statusValue).toBe('Pending');
    });

    it('should return correct shipmentStatus value for Finished', () => {
      // Arrange
      const item: ShipmentItem = {
        id: 124,
        vehicleAssigned: 'BBB222',
        shipmentStatus: ShipmentStatusOptions.Finished,
        createdAt: '2025-10-24T00:00:00.000Z',
      };
      // Act
      const statusValue = component.columns[2]?.value?.(item);
      // Assert
      expect(statusValue).toBe(ShipmentStatusOptions.Finished);
    });

    it('should call onSend when action is triggered', () => {
      // Arrange
      const item: ShipmentItem = {
        id: 123,
        vehicleAssigned: 'AAA111',
        shipmentStatus: ShipmentStatusOptions.Pending,
        createdAt: '2025-10-23T00:00:00.000Z',
      };
      const spy = jest.spyOn(component, 'onSend');
      // Act
      component.columns[4]?.actions?.[1].action(item);
      // Assert
      expect(spy).toHaveBeenCalledWith(item);
    });

    it('should call onFinish when action is triggered', () => {
      // Arrange
      const item: ShipmentItem = {
        id: 123,
        vehicleAssigned: 'AAA111',
        shipmentStatus: ShipmentStatusOptions.Pending,
        createdAt: '2025-10-23T00:00:00.000Z',
      };
      const spy = jest.spyOn(component, 'onFinish');
      // Act
      component.columns[4]?.actions?.[2].action(item);
      // Assert
      expect(spy).toHaveBeenCalledWith(item);
    });
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

    describe('vehicleControl.valueChanges subscription', () => {
      it('should set filteredVehicles and selectedVehicle when a vehicle is selected', fakeAsync(() => {
        // Arrange
        const vehicle: VehicleListItem = {
          id: 2,
          licensePlate: 'BBB222',
          brand: 'Fiat',
          model: 'Cronos',
          kmTraveled: 0,
          enabled: true,
          admissionDate: '',
        };
        const response = { total: 1, results: [vehicle] };
        vehicleService.postSearchVehiclesAsync.mockReturnValue(of(response));
        const spy = jest.spyOn(component, 'emitSearch');

        // Act
        component.vehicleControl.setValue(vehicle);
        tick(400);

        // Assert
        expect(component.filteredVehicles).toEqual([vehicle]);
        expect(component.selectedVehicle).toBe(vehicle);
        expect(component.pageIndex).toBe(0);
        expect(spy).toHaveBeenCalled();
      }));
    });
  });

  describe('onVehicleSearchChange', () => {
    it('should call vehicleService.postSearchVehiclesAsync and set filteredVehicles', () => {
      // Arrange
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'AAA111',
        brand: 'Focus',
        model: 'Focus',
        kmTraveled: 0,
        enabled: true,
        admissionDate: '',
      };
      const response = { total: 1, results: [vehicle] };
      vehicleService.postSearchVehiclesAsync.mockReturnValue(of(response));
      component.vehicleSearchText = 'AAA111';

      // Act
      component.onVehicleSearchChange();

      // Assert
      expect(vehicleService.postSearchVehiclesAsync).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        searchText: 'AAA111',
      });
      expect(component.filteredVehicles).toEqual([vehicle]);
    });

    it('should trim and limit searchText to 50 characters', () => {
      // Arrange
      const longText = 'A'.repeat(60);
      component.vehicleSearchText = ` ${longText} `;
      const response = { total: 0, results: [] };
      vehicleService.postSearchVehiclesAsync.mockReturnValue(of(response));

      // Act
      component.onVehicleSearchChange();

      // Assert
      expect(vehicleService.postSearchVehiclesAsync).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        searchText: 'A'.repeat(50),
      });
    });
  });

  describe('getSearchRequest', () => {
    it('should return default values when searchText is undefined', () => {
      // Arrange
      component.searchText = undefined as unknown as string;
      component.pageIndex = 1;
      component.pageSize = 20;
      component.selectedStatus = ['Pending'];
      component.fromDate = null;
      component.toDate = null;
      component.selectedVehicle = null;

      // Act
      const result = component.getSearchRequest();

      // Assert
      expect(result.searchText).toBe('');
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(20);
      expect(result.filters?.statusName).toEqual(['Pending']);
      expect(result.filters?.fromDate).toBeUndefined();
      expect(result.filters?.toDate).toBeUndefined();
      expect(result.filters?.vehicleId).toBeUndefined();
    });

    it('should limit searchText to 50 characters', () => {
      // Arrange
      component.searchText = 'A'.repeat(60);
      // Act
      const result = component.getSearchRequest();
      // Assert
      expect(result.searchText.length).toBe(50);
      expect(result.searchText).toBe('A'.repeat(50));
    });

    it('should include vehicleId if selectedVehicle is set', () => {
      // Arrange
      component.selectedVehicle = {
        id: 99,
        licensePlate: 'ZZZ999',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 0,
        enabled: true,
        admissionDate: '',
      };
      // Act
      const result = component.getSearchRequest();
      // Assert
      expect(result.filters?.vehicleId).toBe(99);
    });
  });

  describe('isDateRangeValid', () => {
    it('should be true if fromDate is null', () => {
      // Arrange
      component.fromDate = null;
      component.toDate = new Date();
      // Assert
      expect(component.isDateRangeValid).toBe(true);
    });

    it('should be true if toDate is null', () => {
      // Arrange
      component.fromDate = new Date();
      component.toDate = null;
      // Assert
      expect(component.isDateRangeValid).toBe(true);
    });

    it('should be true if fromDate <= toDate', () => {
      // Arrange
      component.fromDate = new Date('2024-07-01');
      component.toDate = new Date('2024-07-31');
      // Assert
      expect(component.isDateRangeValid).toBe(true);
    });

    it('should be false if fromDate > toDate', () => {
      // Arrange
      component.fromDate = new Date('2024-08-01');
      component.toDate = new Date('2024-07-31');
      // Assert
      expect(component.isDateRangeValid).toBe(false);
    });
  });

  describe('onVehicleSelected', () => {
    it('should set selectedVehicle, reset pageIndex and trigger search', () => {
      // Arrange
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      const vehicle: VehicleListItem = {
        id: 2,
        licensePlate: 'BBB222',
        brand: 'Fiat',
        model: 'Cronos',
        kmTraveled: 0,
        enabled: true,
        admissionDate: '',
      };
      component.pageIndex = 5;

      // Act
      component.onVehicleSelected(vehicle);

      // Assert
      expect(component.selectedVehicle).toBe(vehicle);
      expect(component.pageIndex).toBe(0);
      expect(spy).toHaveBeenCalled();
    });
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

  describe('onDetailDrawer', () => {
    it('should open the drawer with correct parameters', () => {
      // Arrange
      const lateralDrawerService = TestBed.inject(LateralDrawerService);
      const spy = jest
        .spyOn(lateralDrawerService, 'open')
        .mockImplementation(() => of(undefined));
      const item: ShipmentItem = {
        id: 123,
        vehicleAssigned: 'AAA111',
        shipmentStatus: ShipmentStatusOptions.Pending,
        createdAt: '2025-10-23T00:00:00.000Z',
      };

      // Act
      component.onDetailDrawer(item);

      // Assert
      expect(spy).toHaveBeenCalledWith(
        ShipmentDetailDrawerComponent,
        { shipmentId: item.id },
        {
          title: `Detalle de Envío #${item.id}`,
          footer: {
            firstButton: {
              text: 'Cerrar',
              click: expect.any(Function),
            },
          },
          size: 'small',
        },
      );
    });
  });
});
