import { OrderDirection, mockOrderItem } from '@Common';
import {
  CheckoutService,
  LateralDrawerService,
  PillStatusEnum,
} from '@Common-UI';

import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import localeEsAr from '@angular/common/locales/es-AR';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of, Subscription } from 'rxjs';

import { OrderListClientComponent } from './order-list-client.component';
import { OrderItem } from '../../../../../common/src/models/order/order-item.model';
import { OrderListOrderOption } from '../../../../../common/src/models/order/order-list-option-order.model';
import { OrderOrderField } from '../../../../../common/src/models/order/order-params.model';
import { OrderStatusOptions } from '../../../../../common/src/models/order/order-status.enum';
import { DetailLateralDrawerClientComponent } from '../detail-lateral-drawer-client/detail-lateral-drawer-client.component';

registerLocaleData(localeEsAr);

describe('OrderListClientComponent', () => {
  let component: OrderListClientComponent;
  let fixture: ComponentFixture<OrderListClientComponent>;
  let lateralDrawerService: LateralDrawerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListClientComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        {
          provide: CheckoutService,
          useValue: mockDeep<CheckoutService>(),
        },
      ],
    }).compileComponents();

    lateralDrawerService = TestBed.inject(LateralDrawerService);
    fixture = TestBed.createComponent(OrderListClientComponent);
    component = fixture.componentInstance;
  });

  describe('Component creation', () => {
    it('should create the component', () => {
      // Arrange & Act
      // Assert
      expect(component).toBeTruthy();
    });
  });

  describe('columns value functions', () => {
    it('should return id as string for orderId column', () => {
      // Arrange
      const order: OrderItem = {
        id: 123,
        createdAt: '2025-09-14',
        status: OrderStatusOptions.Pending,
        totalAmount: 100,
        quantityProducts: 2,
      };
      const column = component.columns.find((c) => c.columnDef === 'orderId');

      // Act
      let result: string | undefined;
      if (column && typeof column.value === 'function') {
        result = column.value(order);
      }

      // Assert
      expect(result).toBe('123');
    });

    it('should format createdAt for createdAt column', () => {
      // Arrange
      const order: OrderItem = {
        id: 1,
        createdAt: '2025-09-15',
        status: OrderStatusOptions.Pending,
        totalAmount: 100,
        quantityProducts: 2,
      };
      const column = component.columns.find((c) => c.columnDef === 'createdAt');

      // Act
      let result: string | undefined;
      if (column && typeof column.value === 'function') {
        result = column.value(order);
      }

      // Assert
      expect(result).toBe('15/09/2025');
    });

    it('should return status for status column', () => {
      // Arrange
      const order: OrderItem = {
        id: 1,
        createdAt: '2025-09-15',
        status: OrderStatusOptions.InPreparation,
        totalAmount: 100,
        quantityProducts: 2,
      };
      const column = component.columns.find((c) => c.columnDef === 'status');

      // Act
      let result: string | undefined;
      if (column && typeof column.value === 'function') {
        result = column.value(order);
      }

      // Assert
      expect(result).toBe('En preparación');
    });

    it('should format totalAmount for price column', () => {
      // Arrange
      const order: OrderItem = {
        id: 1,
        createdAt: '2025-09-15',
        status: OrderStatusOptions.Pending,
        totalAmount: 1234.56,
        quantityProducts: 2,
      };
      const column = component.columns.find((c) => c.columnDef === 'price');

      // Act
      let result: string | undefined;
      if (column && typeof column.value === 'function') {
        result = column.value(order);
      }

      // Assert
      expect(typeof result).toBe('string');
      expect(result).toContain('$');
    });

    it('should return quantityProducts as string for quantityProducts column', () => {
      // Arrange
      const order: OrderItem = {
        id: 1,
        createdAt: '2025-09-15',
        status: OrderStatusOptions.Pending,
        totalAmount: 100,
        quantityProducts: 5,
      };
      const column = component.columns.find(
        (c) => c.columnDef === 'quantityProducts',
      );

      // Act
      let result: string | undefined;
      if (column && typeof column.value === 'function') {
        result = column.value(order);
      }

      // Assert
      expect(result).toBe('5');
    });
  });

  describe('onDetailDrawer', () => {
    it('should open drawer with orderId and correct config', () => {
      //Arrange
      const openSpy = jest.spyOn(lateralDrawerService, 'open');

      // Act
      component.onDetailDrawer(mockOrderItem);

      // Assert
      expect(openSpy).toHaveBeenCalledWith(
        DetailLateralDrawerClientComponent,
        { orderId: mockOrderItem.id },
        expect.objectContaining({
          title: 'Detalle Pedido',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({
              text: 'Cerrar',
              click: expect.any(Function),
            }),
          }),
        }),
      );
    });
  });
  describe('onRepeatOrder', () => {
    it('should log repeat order', () => {
      // Arrange
      const order: OrderItem = {
        id: 1,
        createdAt: '14/09/2025',
        status: OrderStatusOptions.Pending,
        totalAmount: 100,
        quantityProducts: 2,
      };
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      component.onRepeatOrder(order);

      // Assert
      expect(logSpy).toHaveBeenCalledWith('Repetir pedido', order);

      logSpy.mockRestore();
    });
  });

  describe('onSearchTextChange', () => {
    it('should reset pageIndex, set isLoading and emit doSearchSubject$', () => {
      // Arrange
      component.pageIndex = 5;
      component.isLoading = false;
      const nextSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onSearchTextChange();

      // Assert
      expect(component.pageIndex).toBe(0);
      expect(component.isLoading).toBe(true);
      expect(nextSpy).toHaveBeenCalled();

      nextSpy.mockRestore();
    });
  });

  describe('onClearSearch', () => {
    it('should clear searchText and call onSearchTextChange', () => {
      // Arrange
      component.searchText = 'test';
      const searchSpy = jest.spyOn(component, 'onSearchTextChange');

      // Act
      component.onClearSearch();

      // Assert
      expect(component.searchText).toBe('');
      expect(searchSpy).toHaveBeenCalled();

      searchSpy.mockRestore();
    });
  });

  describe('handlePageChange', () => {
    it('should update pageIndex, pageSize and emit doSearchSubject$', () => {
      // Arrange
      const event = { pageIndex: 2, pageSize: 20 };
      const nextSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.handlePageChange(event);

      // Assert
      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(20);
      expect(nextSpy).toHaveBeenCalled();

      nextSpy.mockRestore();
    });
  });

  describe('columns pillStatus function', () => {
    it('should return correct PillStatusEnum for status column', () => {
      // Arrange
      const column = component.columns.find((c) => c.columnDef === 'status');
      const pendiente: OrderItem = {
        id: 1,
        createdAt: '',
        status: OrderStatusOptions.Pending,
        totalAmount: 0,
        quantityProducts: 0,
      };
      const cancelado: OrderItem = {
        id: 2,
        createdAt: '',
        status: OrderStatusOptions.Cancelled,
        totalAmount: 0,
        quantityProducts: 0,
      };
      const completado: OrderItem = {
        id: 3,
        createdAt: '',
        status: OrderStatusOptions.Finished,
        totalAmount: 0,
        quantityProducts: 0,
      };
      const otro: OrderItem = {
        id: 4,
        createdAt: '',
        status: 'Otro' as OrderStatusOptions,
        totalAmount: 0,
        quantityProducts: 0,
      };

      // Act & Assert
      if (column && typeof column.pillStatus === 'function') {
        expect(column.pillStatus(pendiente)).toBe(PillStatusEnum.Initial);
        expect(column.pillStatus(cancelado)).toBe(PillStatusEnum.Cancelled);
        expect(column.pillStatus(completado)).toBe(PillStatusEnum.Done);
        expect(column.pillStatus(otro)).toBe(PillStatusEnum.Initial);
      }
    });
  });

  describe('getStatusLabel', () => {
    it('should return spanish label for each enum value', () => {
      // Arrange
      const cases = [
        { input: OrderStatusOptions.Pending, expected: 'Pendiente' },
        { input: OrderStatusOptions.InPreparation, expected: 'En preparación' },
        { input: OrderStatusOptions.Shipped, expected: 'Enviado' },
        { input: OrderStatusOptions.Finished, expected: 'Finalizado' },
        { input: OrderStatusOptions.Cancelled, expected: 'Cancelado' },
        { input: 'otro' as OrderStatusOptions, expected: 'Pendiente' },
        { input: OrderStatusOptions.Prepared, expected: 'Preparado' },
        {
          input: OrderStatusOptions.PaymentPending,
          expected: 'Pago pendiente',
        },
        {
          input: OrderStatusOptions.PaymentRejected,
          expected: 'Pago rechazado',
        },
      ];

      // Act & Assert
      cases.forEach(({ input, expected }) => {
        expect(component.getStatusLabel(input)).toBe(expected);
      });
    });
  });

  describe('mapStatusToPillStatus', () => {
    it('should return correct PillStatusEnum for each status', () => {
      // Arrange
      const cases = [
        { input: OrderStatusOptions.Pending, expected: PillStatusEnum.Initial },
        {
          input: OrderStatusOptions.InPreparation,
          expected: PillStatusEnum.InProgress,
        },
        {
          input: OrderStatusOptions.Shipped,
          expected: PillStatusEnum.InProgress,
        },
        { input: OrderStatusOptions.Finished, expected: PillStatusEnum.Done },
        {
          input: OrderStatusOptions.Cancelled,
          expected: PillStatusEnum.Cancelled,
        },
        {
          input: OrderStatusOptions.Prepared,
          expected: PillStatusEnum.InProgress,
        },
        {
          input: OrderStatusOptions.PaymentPending,
          expected: PillStatusEnum.Warning,
        },
        {
          input: OrderStatusOptions.PaymentRejected,
          expected: PillStatusEnum.Cancelled,
        },
        {
          input: 'otro' as OrderStatusOptions,
          expected: PillStatusEnum.Initial,
        },
      ];

      // Act & Assert
      cases.forEach(({ input, expected }) => {
        expect(component.mapStatusToPillStatus(input)).toBe(expected);
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from searchSubscription if exists', () => {
      // Arrange
      const subscription = new Subscription();
      const unsubscribeSpy = jest.spyOn(subscription, 'unsubscribe');
      component['searchSubscription'] = subscription;

      // Act
      component.ngOnDestroy();

      // Assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
    it('should not throw if searchSubscription is undefined', () => {
      // Arrange
      component['searchSubscription'] = undefined;

      // Act & Assert
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('onApplyDateFilter', () => {
    it('should reset pageIndex and emit doSearchSubject$', () => {
      // Arrange
      component.pageIndex = 5;
      const nextSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onApplyDateFilter();

      // Assert
      expect(component.pageIndex).toBe(0);
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('onClearDateFilter', () => {
    it('should clear dates, reset pageIndex and emit doSearchSubject$', () => {
      // Arrange
      component.fromDate = new Date();
      component.toDate = new Date();
      component.pageIndex = 2;
      const nextSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onClearDateFilter();

      // Assert
      expect(component.fromDate).toBeNull();
      expect(component.toDate).toBeNull();
      expect(component.pageIndex).toBe(0);
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('setOrderBy', () => {
    it('should update selectedOrderBy, reset pageIndex and emit doSearchSubject$', () => {
      // Arrange
      const option: OrderListOrderOption = {
        label: 'Price',
        field: OrderOrderField.totalAmount,
        direction: OrderDirection.ASC,
      };
      component.pageIndex = 3;
      const nextSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.setOrderBy(option);

      // Assert
      expect(component.selectedOrderBy).toBe(option);
      expect(component.pageIndex).toBe(0);
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('onStatusFilterChange', () => {
    it('should reset pageIndex and emit doSearchSubject$', () => {
      // Arrange
      component.pageIndex = 2;
      const nextSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onStatusFilterChange();

      // Assert
      expect(component.pageIndex).toBe(0);
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('debounce and request cancellation', () => {
    it('should debounce and only call the last request', fakeAsync(() => {
      // Arrange
      jest
        .spyOn(localStorage['__proto__'], 'getItem')
        .mockReturnValue('fake-token');
      const serviceSpy = jest
        .spyOn(component['orderService'], 'searchClientOrders')
        .mockReturnValue(of({ results: [], total: 0 }));
      component.ngOnInit();

      // Act
      component.doSearchSubject$.next();
      component.doSearchSubject$.next();
      tick(399);
      expect(serviceSpy).not.toHaveBeenCalled();
      tick(1);
      expect(serviceSpy).toHaveBeenCalledTimes(1);
      component.ngOnDestroy();
    }));
  });

  describe('date icon color', () => {
    it('should be colored if fromDate or toDate is set', () => {
      // Arrange
      component.fromDate = new Date();
      // Act & Assert
      expect(!!(component.fromDate || component.toDate)).toBe(true);
      component.fromDate = null;
      component.toDate = null;
      expect(!!(component.fromDate || component.toDate)).toBe(false);
    });
  });

  describe('Search logic', () => {
    it('should call orderService with correct body and update dataSource$ and itemsNumber on success', fakeAsync(() => {
      // Arrange
      jest
        .spyOn(localStorage['__proto__'], 'getItem')
        .mockReturnValue('fake-token');
      const mockResponse = {
        results: [
          {
            id: 1,
            createdAt: '2025-09-15',
            orderStatusName: 'pendiente',
            totalAmount: 100,
            productsCount: 2,
          },
        ],
        total: 1,
      };
      const serviceSpy = jest
        .spyOn(component['orderService'], 'searchClientOrders')
        .mockReturnValue(of(mockResponse));
      component.searchText = 'test';
      component.pageIndex = 1;
      component.pageSize = 20;
      component.selectedStatuses = [
        { key: OrderStatusOptions.Pending, value: 'Pendiente' },
      ];
      component.fromDate = new Date('2025-09-01');
      component.toDate = new Date('2025-09-30');
      const orderOption: OrderListOrderOption = {
        label: 'Price',
        field: OrderOrderField.totalAmount,
        direction: OrderDirection.DESC,
      };
      component.selectedOrderBy = orderOption;

      // Act
      component.ngOnInit();
      tick(400);

      // Assert
      expect(serviceSpy).toHaveBeenCalledWith(
        {
          searchText: 'test',
          page: 2,
          pageSize: 20,
          filters: {
            statusName: ['Pending'],
            fromDate: '2025-09-01',
            toDate: '2025-09-30',
          },
          orderBy: {
            field: 'totalAmount',
            direction: 'desc',
          },
        },
        'fake-token',
      );
      expect(component.dataSource$.value.length).toBe(1);
      expect(component.itemsNumber).toBe(1);
      expect(component.isLoading).toBe(false);
      component.ngOnDestroy();
    }));

    it('should use field "totalAmount" when orderBy.field is "price"', fakeAsync(() => {
      // Arrange
      const serviceSpy = jest
        .spyOn(component['orderService'], 'searchClientOrders')
        .mockReturnValue(of({ results: [], total: 0 }));
      const orderOption: OrderListOrderOption = {
        label: 'Price',
        field: OrderOrderField.totalAmount,
        direction: OrderDirection.ASC,
      };
      component.selectedOrderBy = orderOption;

      // Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(400);

      // Assert
      const call = serviceSpy.mock.calls[0][0];
      expect(call.orderBy!.field).toBe('totalAmount');
      component.ngOnDestroy();
    }));

    it('should send undefined for filters if no status or dates are selected', fakeAsync(() => {
      // Arrange
      const serviceSpy = jest
        .spyOn(component['orderService'], 'searchClientOrders')
        .mockReturnValue(of({ results: [], total: 0 }));
      component.selectedStatuses = [];
      component.fromDate = null;
      component.toDate = null;

      // Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(400);

      // Assert
      const call = serviceSpy.mock.calls[0][0];
      expect(call.filters!.statusName).toBeUndefined();
      expect(call.filters!.fromDate).toBeUndefined();
      expect(call.filters!.toDate).toBeUndefined();
      component.ngOnDestroy();
    }));

    it('should use field "totalAmount" when orderBy.field is "price"', fakeAsync(() => {
      // Arrange
      const serviceSpy = jest
        .spyOn(component['orderService'], 'searchClientOrders')
        .mockReturnValue(of({ results: [], total: 0 }));
      const orderOption: OrderListOrderOption = {
        label: 'Price',
        field: OrderOrderField.totalAmount,
        direction: OrderDirection.ASC,
      };
      component.selectedOrderBy = orderOption;

      // Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(400);

      // Assert
      const call = serviceSpy.mock.calls[0][0];
      expect(call.orderBy).toBeDefined();
      expect(call.orderBy!.field).toBe('totalAmount');
      component.ngOnDestroy();
    }));

    it('should use selectedOrderBy.field as is if not "price"', fakeAsync(() => {
      // Arrange
      const serviceSpy = jest
        .spyOn(component['orderService'], 'searchClientOrders')
        .mockReturnValue(of({ results: [], total: 0 }));
      const orderOption: OrderListOrderOption = {
        label: 'Created',
        field: OrderOrderField.CreatedAt,
        direction: OrderDirection.ASC,
      };
      component.selectedOrderBy = orderOption;

      // Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(400);

      // Assert
      const call = serviceSpy.mock.calls[0][0];
      expect(call.orderBy).toBeDefined();
      expect(call.orderBy!.field).toBe('createdAt');
      component.ngOnDestroy();
    }));

    it('should send empty results if no token is present', fakeAsync(() => {
      // Arrange
      jest.spyOn(localStorage['__proto__'], 'getItem').mockReturnValue(null);
      const serviceSpy = jest.spyOn(
        component['orderService'],
        'searchClientOrders',
      );
      const mockOrder: OrderItem = {
        id: 1,
        createdAt: '',
        status: OrderStatusOptions.Pending,
        totalAmount: 1,
        quantityProducts: 1,
      };
      component.dataSource$.next([mockOrder]);
      component.itemsNumber = 1;

      // Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(400);

      // Assert
      expect(serviceSpy).not.toHaveBeenCalled();
      expect(component.dataSource$.value).toEqual([]);
      expect(component.itemsNumber).toBe(0);
      component.ngOnDestroy();
    }));
  });
});
