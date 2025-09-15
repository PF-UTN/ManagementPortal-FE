import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListClientComponent } from './order-list-client.component';
import { OrderItem } from '../../models/order-item.model';

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
