import { PillStatusEnum } from '@Common-UI';

import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import localeEsAr from '@angular/common/locales/es-AR';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { OrderListClientComponent } from './order-list-client.component';
import { OrderClientSearchResponse } from '../../models/order-client-response.model';
import { OrderItem } from '../../models/order-item.model';
import { OrderStatusOptions } from '../../models/order-status.enum';

registerLocaleData(localeEsAr);

describe('OrderListClientComponent', () => {
  let component: OrderListClientComponent;
  let fixture: ComponentFixture<OrderListClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListClientComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component creation', () => {
    it('should create the component', () => {
      // Arrange & Act done in beforeEach
      // Assert
      expect(component).toBeTruthy();
    });
  });

  describe('columns value functions', () => {
    it('should return id as string for orderId column', () => {
      const order: OrderItem = {
        id: 123,
        createdAt: '2025-09-14',
        status: OrderStatusOptions.Pending,
        totalAmount: 100,
        quantityProducts: 2,
      };
      const column = component.columns.find((c) => c.columnDef === 'orderId');
      expect(column).toBeDefined();
      let result: string | undefined;
      if (column && typeof column.value === 'function') {
        result = column.value(order);
      }
      expect(result).toBe('123');
    });

    it('should format createdAt for createdAt column', () => {
      const order: OrderItem = {
        id: 1,
        createdAt: '2025-09-15',
        status: OrderStatusOptions.Pending,
        totalAmount: 100,
        quantityProducts: 2,
      };
      const column = component.columns.find((c) => c.columnDef === 'createdAt');
      expect(column).toBeDefined();
      let result: string | undefined;
      if (column && typeof column.value === 'function') {
        result = column.value(order);
      }
      expect(result).toBe('15/09/2025');
    });

    it('should return status for status column', () => {
      const order: OrderItem = {
        id: 1,
        createdAt: '2025-09-15',
        status: OrderStatusOptions.InPreparation,
        totalAmount: 100,
        quantityProducts: 2,
      };
      const column = component.columns.find((c) => c.columnDef === 'status');
      expect(column).toBeDefined();
      let result: string | undefined;
      if (column && typeof column.value === 'function') {
        result = column.value(order);
      }
      expect(result).toBe('En preparación');
    });

    it('should format totalAmount for price column', () => {
      const order: OrderItem = {
        id: 1,
        createdAt: '2025-09-15',
        status: OrderStatusOptions.Pending,
        totalAmount: 1234.56,
        quantityProducts: 2,
      };
      const column = component.columns.find((c) => c.columnDef === 'price');
      expect(column).toBeDefined();
      let result: string | undefined;
      if (column && typeof column.value === 'function') {
        result = column.value(order);
      }
      expect(typeof result).toBe('string');
      expect(result).toContain('$');
    });

    it('should return quantityProducts as string for quantityProducts column', () => {
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
      expect(column).toBeDefined();
      let result: string | undefined;
      if (column && typeof column.value === 'function') {
        result = column.value(order);
      }
      expect(result).toBe('5');
    });
  });

  describe('onDetailDrawer', () => {
    it('should log order detail', () => {
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
      component.onDetailDrawer(order);

      // Assert
      expect(logSpy).toHaveBeenCalledWith('Ver detalle de la orden', order);

      logSpy.mockRestore();
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

  describe('loadOrders', () => {
    it('should call orderService, map results and update dataSource$', () => {
      // Arrange
      const mockResponse: OrderClientSearchResponse = {
        total: 1,
        results: [
          {
            id: 1,
            orderStatusName: 'Pendiente',
            createdAt: '2025-09-20T11:02:59.042Z',
            totalAmount: 804,
            productsCount: 1,
          },
        ],
      };
      const mappedOrder = {
        id: 1,
        createdAt: '2025-09-20T11:02:59.042Z',
        status: 'Pendiente',
        totalAmount: 804,
        quantityProducts: 1,
      };
      const serviceSpy = jest
        .spyOn(component['orderService'], 'searchClientOrders')
        .mockReturnValue(of(mockResponse));

      // Act
      component.loadOrders();

      // Assert
      expect(serviceSpy).toHaveBeenCalled();
      component.dataSource$.subscribe((data) => {
        expect(data).toEqual([mappedOrder]);
      });
      expect(component.itemsNumber).toBe(1);
      expect(component.isLoading).toBe(false);
    });
    it('should set dataSource$ to empty, itemsNumber to 0 and isLoading to false on error', () => {
      // Arrange
      const serviceSpy = jest
        .spyOn(component['orderService'], 'searchClientOrders')
        .mockReturnValue(throwError(() => new Error('fail')));

      // Act
      component.loadOrders();

      // Assert
      component.dataSource$.subscribe((data) => {
        expect(data).toEqual([]);
      });
      expect(component.itemsNumber).toBe(0);
      expect(component.isLoading).toBe(false);
      expect(serviceSpy).toHaveBeenCalled();
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
        status: OrderStatusOptions.Delivered,
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

  describe('mapStatusNameToEnum', () => {
    it('should map spanish status names to enum', () => {
      // Arrange
      const cases = [
        { input: 'pendiente', expected: OrderStatusOptions.Pending },
        { input: 'en preparación', expected: OrderStatusOptions.InPreparation },
        { input: 'enviado', expected: OrderStatusOptions.Shipped },
        { input: 'entregado', expected: OrderStatusOptions.Delivered },
        { input: 'cancelado', expected: OrderStatusOptions.Cancelled },
        { input: 'devuelto', expected: OrderStatusOptions.Returned },
        { input: 'desconocido', expected: OrderStatusOptions.Pending },
        { input: undefined, expected: OrderStatusOptions.Pending },
      ];

      // Act & Assert
      cases.forEach(({ input, expected }) => {
        expect(component['mapStatusNameToEnum'](input)).toBe(expected);
      });
    });
  });

  describe('getStatusLabel', () => {
    it('should return spanish label for each enum value', () => {
      // Arrange
      const cases = [
        { input: OrderStatusOptions.Pending, expected: 'Pendiente' },
        { input: OrderStatusOptions.InPreparation, expected: 'En preparación' },
        { input: OrderStatusOptions.Shipped, expected: 'Enviado' },
        { input: OrderStatusOptions.Delivered, expected: 'Entregado' },
        { input: OrderStatusOptions.Cancelled, expected: 'Cancelado' },
        { input: OrderStatusOptions.Returned, expected: 'Devuelto' },
        { input: 'otro' as OrderStatusOptions, expected: 'Pendiente' },
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
        { input: OrderStatusOptions.Delivered, expected: PillStatusEnum.Done },
        {
          input: OrderStatusOptions.Cancelled,
          expected: PillStatusEnum.Cancelled,
        },
        {
          input: OrderStatusOptions.Returned,
          expected: PillStatusEnum.Warning,
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
});
