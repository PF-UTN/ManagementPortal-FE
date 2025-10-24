import {
  VehicleService,
  downloadFileFromResponse,
  VehicleListItem,
} from '@Common';
import {
  LateralDrawerService,
  PillStatusEnum,
  ColumnTypeEnum,
} from '@Common-UI';

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
import { ShipmentSearchRequest } from '../../models/shipment-search.model';
import { ShipmentStatusOptions } from '../../models/shipment-status.enum';
import { ShipmentService } from '../../services/shipment.service';
import { ShipmentDetailDrawerComponent } from '../shipment-detail-drawer/shipment-detail-drawer.component';
import { ShipmentSendDrawerComponent } from '../shipment-send-drawer/shipment-send-drawer.component';

jest.mock('@Common', () => ({
  ...jest.requireActual('@Common'),
  downloadFileFromResponse: jest.fn(),
}));

describe('ShipmentListComponent', () => {
  let component: ShipmentListComponent;
  let fixture: ComponentFixture<ShipmentListComponent>;
  let shipmentService: jest.Mocked<ShipmentService>;
  let vehicleService: jest.Mocked<VehicleService>;
  let lateralDrawerService: LateralDrawerService;

  beforeEach(async () => {
    shipmentService = {
      searchShipments: jest.fn(),
      downloadShipments: jest.fn(),
      sendShipment: jest.fn(),
      downloadReport: jest.fn(),
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

    lateralDrawerService = TestBed.inject(LateralDrawerService);
    jest
      .spyOn(lateralDrawerService, 'open')
      .mockImplementation(() => of(undefined));

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
        date: '2025-10-23T00:00:00.000Z',
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
        date: '2025-10-23T00:00:00.000Z',
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
        date: '2025-10-23T00:00:00.000Z',
      };
      // Act
      const statusValue = component.columns[2]?.value?.(item);
      // Assert
      expect(statusValue).toBe('Pendiente');
    });

    it('should return correct shipmentStatus value for Finished', () => {
      // Arrange
      const item: ShipmentItem = {
        id: 124,
        vehicleAssigned: 'BBB222',
        shipmentStatus: ShipmentStatusOptions.Finished,
        date: '2025-10-24T00:00:00.000Z',
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
        date: '2025-10-23T00:00:00.000Z',
      };
      const spy = jest.spyOn(component, 'onSend');
      const lateralDrawerService = TestBed.inject(LateralDrawerService);
      jest
        .spyOn(lateralDrawerService, 'open')
        .mockImplementation(() => of(undefined));

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
        date: '2025-10-23T00:00:00.000Z',
      };
      const spy = jest.spyOn(component, 'onFinish');
      // Act
      component.columns[4]?.actions?.[2].action(item);
      // Assert
      expect(spy).toHaveBeenCalledWith(item);
    });

    it('should disable "Enviar" action if shipmentStatus is not Pending', () => {
      // Arrange
      const item: ShipmentItem = {
        id: 123,
        vehicleAssigned: 'AAA111',
        shipmentStatus: ShipmentStatusOptions.Shipped,
        date: '2025-10-23T00:00:00.000Z',
      };
      // Act
      const isDisabled = component.columns[4]?.actions?.[1].disabled?.(item);
      // Assert
      expect(isDisabled).toBe(true);
    });

    it('should enable "Enviar" action if shipmentStatus is Pending', () => {
      // Arrange
      const item: ShipmentItem = {
        id: 124,
        vehicleAssigned: 'BBB222',
        shipmentStatus: ShipmentStatusOptions.Pending,
        date: '2025-10-24T00:00:00.000Z',
      };
      // Act
      const isDisabled = component.columns[4]?.actions?.[1].disabled?.(item);
      // Assert
      expect(isDisabled).toBe(false);
    });

    it('should disable "Finalizar" action if shipmentStatus is not Shipped', () => {
      // Arrange
      const item: ShipmentItem = {
        id: 123,
        vehicleAssigned: 'AAA111',
        shipmentStatus: ShipmentStatusOptions.Pending,
        date: '2025-10-23T00:00:00.000Z',
      };
      // Act
      const isDisabled = component.columns[4]?.actions?.[2].disabled?.(item);
      // Assert
      expect(isDisabled).toBe(true);
    });

    it('should enable "Finalizar" action if shipmentStatus is Shipped', () => {
      // Arrange
      const item: ShipmentItem = {
        id: 124,
        vehicleAssigned: 'BBB222',
        shipmentStatus: ShipmentStatusOptions.Shipped,
        date: '2025-10-24T00:00:00.000Z',
      };
      // Act
      const isDisabled = component.columns[4]?.actions?.[2].disabled?.(item);
      // Assert
      expect(isDisabled).toBe(false);
    });

    it('should have column type PILL for shipmentStatus', () => {
      // Arrange & Act
      const col = component.columns[2];

      // Assert
      expect(col.type).toBe(ColumnTypeEnum.PILL);
    });

    it('should map "Pendiente" to PillStatusEnum.Initial', () => {
      // Arrange
      const itemEs = {
        id: 1,
        vehicleAssigned: 'AAA111',
        shipmentStatus: 'Pendiente',
        date: '2025-10-23T00:00:00.000Z',
      } as unknown as ShipmentItem;

      // Act
      const pillEs = component.columns[2].pillStatus?.(itemEs);

      // Assert
      expect(pillEs).toBe(PillStatusEnum.Initial);
    });

    it('should map Shipped to PillStatusEnum.InProgress', () => {
      // Arrange
      const items: ShipmentItem[] = [
        {
          id: 3,
          vehicleAssigned: 'BBB222',
          shipmentStatus: ShipmentStatusOptions.Shipped,
          date: '',
        },
      ];

      // Act / Assert
      for (const it of items) {
        const pill = component.columns[2].pillStatus?.(it);
        expect(pill).toBe(PillStatusEnum.InProgress);
      }
    });

    it('should map Finished to PillStatusEnum.Done', () => {
      // Arrange
      const items: ShipmentItem[] = [
        {
          id: 5,
          vehicleAssigned: 'BBB222',
          shipmentStatus: ShipmentStatusOptions.Finished,
          date: '',
        },
      ];

      // Act / Assert
      for (const it of items) {
        const pill = component.columns[2].pillStatus?.(it);
        expect(pill).toBe(PillStatusEnum.Done);
      }
    });

    it('should return PillStatusEnum.Warning for unknown status', () => {
      // Arrange
      const item = {
        id: 7,
        vehicleAssigned: 'CCC333',
        shipmentStatus: 'AlgoDesconocido',
        date: '',
      } as unknown as ShipmentItem;

      // Act
      const pill = component.columns[2].pillStatus?.(item);

      // Assert
      expect(pill).toBe(PillStatusEnum.Warning);
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
        date: '2025-10-23T00:00:00.000Z',
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

  describe('getSearchRequest', () => {
    it('should map selectedStatus from español to inglés for backend', () => {
      // Arrange
      component.selectedStatus = ['Pendiente', 'Enviado', 'Finalizado'];
      // Act
      const result = component.getSearchRequest();
      // Assert
      expect(result.filters?.statusName).toEqual([
        'Pending',
        'Shipped',
        'Finished',
      ]);
    });
  });

  describe('onSend', () => {
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
        date: '2025-10-23T00:00:00.000Z',
      };

      // Act
      component.onSend(item);

      // Assert
      expect(spy).toHaveBeenCalledWith(
        ShipmentSendDrawerComponent,
        { shipmentId: item.id },
        {
          title: `Iniciar Envío #${item.id}`,
          footer: {
            firstButton: {
              text: 'Enviar',
              click: expect.any(Function),
            },
            secondButton: {
              text: 'Cerrar',
              click: expect.any(Function),
            },
          },
          size: 'small',
        },
      );
    });
  });

  describe('ngOnInit data mapping', () => {
    it('should map API response to ShipmentItem correctly', (done) => {
      // Arrange
      const apiResponse = {
        total: 1,
        results: [
          {
            id: 42,
            vehicle: {
              id: 1,
              licensePlate: 'ABC123',
              brand: 'Toyota',
              model: 'Corolla',
            },
            status: 'Pendiente',
            date: '2025-10-23T00:00:00.000Z',
            orders: [],
            estimatedKm: 0,
            effectiveKm: 0,
            routeLink: null,
          },
        ],
      };
      const expectedItem: ShipmentItem = {
        id: 42,
        vehicleAssigned: 'ABC123',
        shipmentStatus: ShipmentStatusOptions.Pending,
        date: '2025-10-23T00:00:00.000Z',
      };
      shipmentService.searchShipments.mockReturnValue(of(apiResponse));

      // Act
      component.emitSearch();

      // Assert
      component.dataSource$.subscribe((items) => {
        expect(items[0]).toEqual(expectedItem);
        done();
      });
    });

    it('should fallback to Pending if status is unknown', (done) => {
      // Arrange
      const apiResponse = {
        total: 1,
        results: [
          {
            id: 99,
            vehicle: {
              id: 2,
              licensePlate: 'ZZZ999',
              brand: 'Ford',
              model: 'Focus',
            },
            status: 'Desconocido',
            date: '2025-10-24T00:00:00.000Z',
            orders: [],
            estimatedKm: 0,
            effectiveKm: 0,
            routeLink: null,
          },
        ],
      };
      shipmentService.searchShipments.mockReturnValue(of(apiResponse));

      // Act
      component.emitSearch();

      // Assert
      component.dataSource$.subscribe((items) => {
        expect(items[0].shipmentStatus).toBe(ShipmentStatusOptions.Pending);
        done();
      });
    });
  });

  describe('onFinish', () => {
    it('should open the drawer with correct parameters for onFinish', () => {
      // Arrange
      const lateralDrawerService = TestBed.inject(LateralDrawerService);
      const spy = jest
        .spyOn(lateralDrawerService, 'open')
        .mockImplementation(() => of(undefined));
      const item: ShipmentItem = {
        id: 123,
        vehicleAssigned: 'AAA111',
        shipmentStatus: ShipmentStatusOptions.Shipped,
        date: '2025-10-23T00:00:00.000Z',
      };

      // Act
      component.onFinish(item);

      // Assert
      expect(spy).toHaveBeenCalledWith(
        expect.any(Function),
        { shipmentId: item.id },
        {
          title: `Finalizar Envío #${item.id}`,
          footer: {
            firstButton: {
              text: 'Finalizar',
              click: expect.any(Function),
            },
            secondButton: {
              text: 'Cerrar',
              click: expect.any(Function),
            },
          },
          size: 'small',
        },
      );
    });
  });
  describe('handleDownloadReport', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call shipmentService.downloadReport and trigger file download', () => {
      // arrange
      const shipmentId = 123;
      const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
      const mockResponse = new HttpResponse({ body: mockBlob, status: 200 });
      shipmentService.downloadReport.mockReturnValue(of(mockResponse));

      // act
      component.handleDownloadReport(shipmentId);

      // assert
      expect(shipmentService.downloadReport).toHaveBeenCalledWith(shipmentId);
      expect(downloadFileFromResponse).toHaveBeenCalledWith(
        mockResponse,
        `envio-${shipmentId}.pdf`,
      );
    });
  });
});
