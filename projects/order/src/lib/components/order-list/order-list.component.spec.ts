import {
  downloadFileFromResponse,
  OrderService,
  mockOrderSearchResponse,
} from '@Common';
import { PillStatusEnum } from '@Common-UI';

import { DatePipe, CurrencyPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { OrderListComponent } from './order-list.component';
import { OrderItem } from '../../../../../common/src/models/order/order-item-general.model';
import { OrderSearchResult } from '../../../../../common/src/models/order/order-response-model';
import { OrderStatusOptions } from '../../../../../common/src/models/order/order-status.enum';
import { CreateShipmentDrawerComponent } from '../create-shipment-drawer/create-shipment-drawer.component';

jest.mock('@Common', () => ({
  ...jest.requireActual('@Common'),
  downloadFileFromResponse: jest.fn(),
  OrderDirection: {
    ASC: 'asc',
    DESC: 'desc',
  },
}));

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let service: OrderService;

  const orderServiceMock = {
    searchOrders: jest.fn().mockReturnValue(of(mockOrderSearchResponse)),
    downloadOrderList: jest.fn(),
    markOrderAsPrepared: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListComponent, NoopAnimationsModule],
      providers: [
        { provide: OrderService, useValue: orderServiceMock },
        DatePipe,
        CurrencyPipe,
      ],
    }).compileComponents();

    service = TestBed.inject(OrderService);
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('should fetch data on init and update dataSource$', fakeAsync(() => {
      jest
        .spyOn(service, 'searchOrders')
        .mockReturnValue(of(mockOrderSearchResponse));
      component.ngOnInit();
      tick(500);

      expect(component.dataSource$.value).toEqual(
        mockOrderSearchResponse.results.map((r: OrderSearchResult) =>
          component['mapToOrderItem'](r),
        ),
      );
    }));

    it('should set loading to false when data is fetched', fakeAsync(() => {
      jest
        .spyOn(service, 'searchOrders')
        .mockReturnValue(of(mockOrderSearchResponse));
      component.ngOnInit();
      tick(500);

      expect(component.isLoading).toBe(false);
    }));

    it('should handle error and set loading to false', fakeAsync(() => {
      jest
        .spyOn(service, 'searchOrders')
        .mockReturnValue(throwError(() => new Error('Error')));
      component.ngOnInit();
      tick(500);

      expect(component.isLoading).toBe(false);
      expect(component.dataSource$.value).toEqual([]);
    }));
  });
  describe('handlePageChange', () => {
    it('should update pageIndex and pageSize and trigger search', () => {
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      const event = { pageIndex: 2, pageSize: 20 };

      component.handlePageChange(event);

      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(20);
      expect(spy).toHaveBeenCalledWith();
    });
  });

  describe('onApplyDateFilter', () => {
    it('should reset pageIndex and trigger search', () => {
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      component.pageIndex = 5;

      component.onApplyDateFilter();

      expect(component.pageIndex).toBe(0);
      expect(spy).toHaveBeenCalledWith();
    });
  });

  describe('onClearDateFilter', () => {
    it('should clear dates and trigger search', () => {
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      component.fromDate = new Date();
      component.toDate = new Date();

      component.onClearDateFilter();

      expect(component.fromDate).toBeNull();
      expect(component.toDate).toBeNull();
      expect(component.pageIndex).toBe(0);
      expect(spy).toHaveBeenCalledWith();
    });
  });
  describe('onSearchTextChange', () => {
    it('should reset pageIndex, set loading and trigger search', () => {
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      component.pageIndex = 3;

      component.onSearchTextChange();

      expect(component.pageIndex).toBe(0);
      expect(component.isLoading).toBe(true);
      expect(spy).toHaveBeenCalledWith();
    });
  });

  describe('onClearSearch', () => {
    it('should clear searchText and trigger search', () => {
      const spy = jest.spyOn(component, 'onSearchTextChange');
      component.searchText = 'test';

      component.onClearSearch();

      expect(component.searchText).toBe('');
      expect(spy).toHaveBeenCalled();
    });
  });
  describe('onStatusFilterChange', () => {
    it('should reset pageIndex and trigger search', () => {
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      component.pageIndex = 2;

      component.onStatusFilterChange();

      expect(component.pageIndex).toBe(0);
      expect(spy).toHaveBeenCalledWith();
    });
  });

  describe('setOrderBy', () => {
    it('should set selectedOrderBy, reset pageIndex and trigger search', () => {
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      const option = component.orderByOptions[1];
      component.pageIndex = 2;

      component.setOrderBy(option);

      expect(component.selectedOrderBy).toBe(option);
      expect(component.pageIndex).toBe(0);
      expect(spy).toHaveBeenCalledWith();
    });
  });
  describe('mapStatusToPillStatus', () => {
    it('should return correct PillStatusEnum for Finished', () => {
      expect(component.mapStatusToPillStatus(OrderStatusOptions.Finished)).toBe(
        PillStatusEnum.Done,
      );
    });
    it('should return correct PillStatusEnum for Cancelled', () => {
      expect(
        component.mapStatusToPillStatus(OrderStatusOptions.Cancelled),
      ).toBe(PillStatusEnum.Cancelled);
    });
  });
  describe('handleDownloadClick', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call orderService.downloadOrderList with correct params and trigger file download', () => {
      // Arrange
      const params = component['getOrderParams']();
      const mockResponse = new HttpResponse({
        body: new Blob(['test'], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        status: 200,
        statusText: 'OK',
      });
      jest
        .spyOn(service, 'downloadOrderList')
        .mockReturnValue(of(mockResponse));

      // Act
      component.handleDownloadClick();

      // Assert
      expect(service.downloadOrderList).toHaveBeenCalledWith(params);
      expect(downloadFileFromResponse).toHaveBeenCalledWith(
        mockResponse,
        'pedidos.xlsx',
      );
    });

    it('should handle errors from purchaseOrderService.downloadPurchaseOrderList', () => {
      // Arrange
      jest
        .spyOn(service, 'downloadOrderList')
        .mockReturnValueOnce(throwError(() => new Error('Download error')));

      // Act
      component.handleDownloadClick();

      // Assert
      expect(downloadFileFromResponse).not.toHaveBeenCalled();
    });
  });

  describe('isDateRangeValid', () => {
    it('should return true if fromDate is before toDate', () => {
      // Arrange
      component.fromDate = new Date('2024-01-01');
      component.toDate = new Date('2024-01-31');
      // Act
      const result = component.isDateRangeValid;
      // Assert
      expect(result).toBe(true);
    });

    it('should return true if fromDate or toDate is null', () => {
      // Arrange
      component.fromDate = null;
      component.toDate = new Date('2024-01-31');
      // Act
      const result1 = component.isDateRangeValid;
      // Assert
      expect(result1).toBe(true);

      // Arrange
      component.fromDate = new Date('2024-01-01');
      component.toDate = null;
      // Act
      const result2 = component.isDateRangeValid;
      // Assert
      expect(result2).toBe(true);
    });

    it('should return false if fromDate is after toDate', () => {
      // Arrange
      component.fromDate = new Date('2024-02-01');
      component.toDate = new Date('2024-01-01');
      // Act
      const result = component.isDateRangeValid;
      // Assert
      expect(result).toBe(false);
    });
  });
  describe('getOrderParams', () => {
    it('should not include filters if none are set', () => {
      // Arrange
      component.selectedStatus = [];
      component.fromDate = null;
      component.toDate = null;

      // Act
      const params = component['getOrderParams']();

      // Assert
      expect(params.filters.statusName).toBeUndefined();
      expect(params.filters.fromCreatedAtDate).toBeUndefined();
      expect(params.filters.toCreatedAtDate).toBeUndefined();
    });
    it('should include all filters if set', () => {
      // Arrange
      component.selectedStatus = ['Pending', 'Finished'];
      component.fromDate = new Date('2024-01-01');
      component.toDate = new Date('2024-01-31');

      // Act
      const params = component['getOrderParams']();

      // Assert
      expect(params.filters.statusName).toEqual(['Pending', 'Finished']);
      expect(params.filters.fromCreatedAtDate).toBe('2024-01-01');
      expect(params.filters.toCreatedAtDate).toBe('2024-01-31');
    });

    it('should include deliveryMethod filter if selectedDeliveryTypes is set', () => {
      // Arrange
      component.selectedDeliveryTypes = [2, 1];

      // Act
      const params = component['getOrderParams']();

      // Assert
      expect(params.filters.deliveryMethodId).toEqual([2, 1]);
    });

    it('should not include deliveryMethod filter if selectedDeliveryTypes is empty', () => {
      // Arrange
      component.selectedDeliveryTypes = [];

      // Act
      const params = component['getOrderParams']();

      // Assert
      expect(params.filters.deliveryMethodId).toBeUndefined();
    });

    it('should not include shipmentId filter if selectedShipmentId is -1', () => {
      // Arrange
      component.selectedShipmentId = -1;

      // Act
      const params = component['getOrderParams']();

      // Assert
      expect(params.filters.shipmentId).toBeUndefined();
    });

    it('should include shipmentId filter as null if selectedShipmentId is -2 ("Sin asignar")', () => {
      // Arrange
      component.selectedShipmentId = -2;

      // Act
      const params = component['getOrderParams']();

      // Assert
      expect(params.filters.shipmentId).toBeNull();
    });

    it('should include shipmentId filter if selectedShipmentId is a number', () => {
      // Arrange
      component.selectedShipmentId = 123;

      // Act
      const params = component['getOrderParams']();

      // Assert
      expect(params.filters.shipmentId).toBe(123);
    });

    it('should set shipmentId to null in filters if selectedShipmentId is -2', () => {
      // Arrange
      component.selectedShipmentId = -2;

      // Act
      const params = component['getOrderParams']();

      // Assert
      expect(params.filters.shipmentId).toBeNull();
    });
  });

  describe('select column', () => {
    it('should disable selection if order status is not Pending', () => {
      // Arrange
      const column = component.columns.find((c) => c.columnDef === 'select');
      const order: OrderItem = {
        id: 1,
        createdAt: '',
        clientName: '',
        orderStatus: OrderStatusOptions.Finished,
        totalAmount: 100,
        selected: false,
        deliveryMethod: 'Entrega a Domicilio',
        shipmentId: null,
      };

      // Act
      const result = column?.disabled?.(order);

      // Assert
      expect(result).toBe(true);
    });

    it('should enable selection if order status is Pending', () => {
      // Arrange
      const column = component.columns.find((c) => c.columnDef === 'select');
      const order: OrderItem = {
        id: 1,
        createdAt: '',
        clientName: '',
        orderStatus: OrderStatusOptions.Pending,
        totalAmount: 100,
        selected: false,
        deliveryMethod: 'Entrega a Domicilio',
        shipmentId: null,
      };

      // Act
      const result = column?.disabled?.(order);

      // Assert
      expect(result).toBe(false);
    });

    it('should disable "Marcar como preparada" if order status is not InPreparation', () => {
      // Arrange
      const column = component.columns.find((c) => c.columnDef === 'actions');
      const action = column?.actions?.find(
        (a) => a.description === 'Marcar como preparada',
      );
      const order: OrderItem = {
        id: 1,
        createdAt: '',
        clientName: '',
        orderStatus: OrderStatusOptions.Finished,
        totalAmount: 100,
        selected: false,
        deliveryMethod: 'Entrega a Domicilio',
        shipmentId: null,
      };

      // Act
      const result = action?.disabled?.(order);

      // Assert
      expect(result).toBe(true);
    });

    it('should enable "Marcar como preparada" if order status is InPreparation', () => {
      // Arrange
      const column = component.columns.find((c) => c.columnDef === 'actions');
      const action = column?.actions?.find(
        (a) => a.description === 'Marcar como preparada',
      );
      const order: OrderItem = {
        id: 2,
        createdAt: '',
        clientName: '',
        orderStatus: OrderStatusOptions.InPreparation,
        totalAmount: 200,
        selected: false,
        deliveryMethod: 'Entrega a Domicilio',
        shipmentId: null,
      };

      // Act
      const result = action?.disabled?.(order);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('onCreateShipment', () => {
    it('should open the create shipment drawer with selected orders', () => {
      // Arrange
      const openSpy = jest
        .spyOn(component['lateralDrawerService'], 'open')
        .mockReturnValue(of(undefined));
      const selectedOrders: OrderItem[] = [
        {
          id: 1,
          createdAt: '',
          clientName: '',
          orderStatus: OrderStatusOptions.Pending,
          totalAmount: 100,
          selected: true,
          deliveryMethod: 'Entrega a Domicilio',
          shipmentId: null,
        },
        {
          id: 2,
          createdAt: '',
          clientName: '',
          orderStatus: OrderStatusOptions.Pending,
          totalAmount: 200,
          selected: false,
          deliveryMethod: 'Entrega a Domicilio',
          shipmentId: null,
        },
        {
          id: 3,
          createdAt: '',
          clientName: '',
          orderStatus: OrderStatusOptions.Pending,
          totalAmount: 300,
          selected: true,
          deliveryMethod: 'Entrega a Domicilio',
          shipmentId: null,
        },
      ];
      component.dataSource$.next(selectedOrders);

      // Act
      component.onCreateShipment();

      // Assert
      expect(openSpy).toHaveBeenCalledWith(
        CreateShipmentDrawerComponent,
        { selectedOrders: [selectedOrders[0], selectedOrders[2]] },
        expect.objectContaining({
          title: 'Crear Envío',
          size: 'small',
          footer: expect.any(Object),
        }),
      );
    });

    it('should refresh the list after closing the drawer', () => {
      // Arrange
      jest
        .spyOn(component['lateralDrawerService'], 'open')
        .mockReturnValue(of(undefined));
      const searchSpy = jest.spyOn(component.doSearchSubject$, 'next');
      const selectedOrders: OrderItem[] = [
        {
          id: 1,
          createdAt: '',
          clientName: '',
          orderStatus: OrderStatusOptions.Pending,
          totalAmount: 100,
          selected: true,
          deliveryMethod: 'Entrega a Domicilio',
          shipmentId: null,
        },
      ];
      component.dataSource$.next(selectedOrders);

      // Act
      component.onCreateShipment();

      // Assert
      expect(searchSpy).toHaveBeenCalled();
    });
  });

  describe('onMarkAsPrepared', () => {
    it('should open the modal and call markOrderAsPrepared if confirmed', () => {
      // Arrange
      const dialog = TestBed.inject(MatDialog);
      const snackBar = TestBed.inject(MatSnackBar);
      const order: OrderItem = {
        id: 3,
        createdAt: '',
        clientName: '',
        orderStatus: OrderStatusOptions.InPreparation,
        totalAmount: 300,
        selected: false,
        deliveryMethod: 'Entrega a Domicilio',
        shipmentId: null,
      };
      const dialogRef = { afterClosed: () => of(true) };
      jest
        .spyOn(dialog, 'open')
        .mockReturnValue(dialogRef as ReturnType<typeof dialog.open>);
      const markSpy = jest
        .spyOn(service, 'markOrderAsPrepared')
        .mockReturnValue(of(undefined));
      const snackSpy = jest.spyOn(snackBar, 'open');
      const searchSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onMarkAsPrepared(order);

      // Assert
      expect(dialog.open).toHaveBeenCalled();
      expect(markSpy).toHaveBeenCalledWith(order.id, 6);
      expect(snackSpy).toHaveBeenCalledWith(
        'Orden preparada con éxito',
        'Cerrar',
        { duration: 3000 },
      );
      expect(searchSpy).toHaveBeenCalled();
      expect(component.isLoading).toBe(true);
    });

    it('should open the modal and not call markOrderAsPrepared if cancelled', () => {
      // Arrange
      const dialog = TestBed.inject(MatDialog);
      const order: OrderItem = {
        id: 4,
        createdAt: '',
        clientName: '',
        orderStatus: OrderStatusOptions.InPreparation,
        totalAmount: 400,
        selected: false,
        deliveryMethod: 'Entrega a Domicilio',
        shipmentId: null,
      };
      const dialogRef = { afterClosed: () => of(false) };
      jest
        .spyOn(dialog, 'open')
        .mockReturnValue(dialogRef as ReturnType<typeof dialog.open>);
      const markSpy = jest
        .spyOn(service, 'markOrderAsPrepared')
        .mockReturnValue(of(undefined));

      // Act
      component.onMarkAsPrepared(order);

      // Assert
      expect(dialog.open).toHaveBeenCalled();
      expect(markSpy).not.toHaveBeenCalled();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('onDeliveryTypeFilterChange', () => {
    it('should reset pageIndex and trigger search', () => {
      // Arrange
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      component.pageIndex = 5;

      // Act
      component.onDeliveryTypeFilterChange();

      // Assert
      expect(component.pageIndex).toBe(0);
      expect(spy).toHaveBeenCalledWith();
    });
  });

  describe('shipmentId column value', () => {
    it('should show "Envío #id" if shipmentId is a number', () => {
      // Arrange
      const column = component.columns.find(
        (c) => c.columnDef === 'shipmentId',
      );
      const order: OrderItem = {
        id: 1,
        createdAt: '',
        clientName: '',
        orderStatus: OrderStatusOptions.Pending,
        totalAmount: 100,
        selected: false,
        deliveryMethod: 'Entrega a Domicilio',
        shipmentId: 55,
      };

      // Act
      const value = column?.value?.(order);

      // Assert
      expect(value).toBe('Envío #55');
    });

    it('should show "Sin asignar" if shipmentId is null', () => {
      // Arrange
      const column = component.columns.find(
        (c) => c.columnDef === 'shipmentId',
      );
      const order: OrderItem = {
        id: 2,
        createdAt: '',
        clientName: '',
        orderStatus: OrderStatusOptions.Pending,
        totalAmount: 100,
        selected: false,
        deliveryMethod: 'Entrega a Domicilio',
        shipmentId: null,
      };

      // Act
      const value = column?.value?.(order);

      // Assert
      expect(value).toBe('Sin asignar');
    });

    it('should show "Sin asignar" if shipmentId is undefined', () => {
      // Arrange
      const column = component.columns.find(
        (c) => c.columnDef === 'shipmentId',
      );
      const order: OrderItem = {
        id: 3,
        createdAt: '',
        clientName: '',
        orderStatus: OrderStatusOptions.Pending,
        totalAmount: 100,
        selected: false,
        deliveryMethod: 'Entrega a Domicilio',
        shipmentId: null,
      };

      // Act
      const value = column?.value?.(order);

      // Assert
      expect(value).toBe('Sin asignar');
    });
  });

  describe('onShipmentIdFilterChange', () => {
    it('should reset pageIndex and trigger search', () => {
      // Arrange
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      component.pageIndex = 5;

      // Act
      component.onShipmentIdFilterChange();

      // Assert
      expect(component.pageIndex).toBe(0);
      expect(spy).toHaveBeenCalledWith();
    });
  });
});
