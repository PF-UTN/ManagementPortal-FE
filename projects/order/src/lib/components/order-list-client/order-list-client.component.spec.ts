import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListClientComponent } from './order-list-client.component';
import { OrderItem } from '../../models/order-item.model';

registerLocaleData(localeEsAr);

describe('OrderListClientComponent', () => {
  let component: OrderListClientComponent;
  let fixture: ComponentFixture<OrderListClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListClientComponent],
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
        status: 'pendiente',
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
        status: 'pendiente',
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
        status: 'procesando',
        totalAmount: 100,
        quantityProducts: 2,
      };
      const column = component.columns.find((c) => c.columnDef === 'status');
      expect(column).toBeDefined();
      let result: string | undefined;
      if (column && typeof column.value === 'function') {
        result = column.value(order);
      }
      expect(result).toBe('procesando');
    });

    it('should format totalAmount for price column', () => {
      const order: OrderItem = {
        id: 1,
        createdAt: '2025-09-15',
        status: 'pendiente',
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
        status: 'pendiente',
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
        status: 'pendiente',
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
        status: 'pendiente',
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
});
