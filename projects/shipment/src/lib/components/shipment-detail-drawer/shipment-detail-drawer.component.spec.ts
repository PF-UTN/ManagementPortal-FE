import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import { ShipmentDetailDrawerComponent } from './shipment-detail-drawer.component';
import {
  ShipmentDetail,
  ShipmentOrder,
} from '../../models/shipment-deatil.model';
import { statusOptions } from '../../models/shipment-status-option.model';
import { ShipmentService } from '../../services/shipment.service';

describe('ShipmentDetailDrawerComponent', () => {
  let component: ShipmentDetailDrawerComponent;
  let fixture: ComponentFixture<ShipmentDetailDrawerComponent>;
  let shipmentService: jest.Mocked<ShipmentService>;

  const mockDetail: ShipmentDetail = {
    id: 25,
    date: '2025-10-10T00:00:00.000Z',
    estimatedKm: 100,
    effectiveKm: 90,
    finishedAt: null,
    routeLink: 'https://maps.example.com',
    vehicle: {
      id: 12,
      licensePlate: 'AAA111',
      brand: 'Focus',
      model: 'Focus',
      kmTraveled: 15000,
    },
    status: 'Shipped',
    orders: [
      { id: 42, status: 'Prepared' },
      { id: 24, status: 'InPreparation' },
    ],
  };

  beforeEach(async () => {
    shipmentService = {
      getShipmentById: jest.fn(),
    } as unknown as jest.Mocked<ShipmentService>;

    await TestBed.configureTestingModule({
      imports: [ShipmentDetailDrawerComponent],
      providers: [{ provide: ShipmentService, useValue: shipmentService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentDetailDrawerComponent);
    component = fixture.componentInstance;
  });

  describe('creation', () => {
    it('should create', () => {
      // Arrange, Act, Assert
      expect(component).toBeTruthy();
    });
  });

  describe('orderColumns', () => {
    it('should have correct column definitions for id', () => {
      // Arrange
      const column = component.orderColumns[0];
      const order: ShipmentOrder = { id: 123, status: 'Prepared' };

      // Assert
      expect(column.columnDef).toBe('id');
      expect(column.header).toBe('N° Orden');
      expect(column.type).toBe('value');
      expect(column.width).toBe('60%');
      expect(column.value!(order)).toBe('123');
    });

    it('should have correct column definitions for status', () => {
      // Arrange
      const column = component.orderColumns[1];
      const order: ShipmentOrder = { id: 123, status: 'Prepared' };

      // Assert
      expect(column.columnDef).toBe('status');
      expect(column.header).toBe('Estado');
      expect(column.type).toBe('value');
      expect(column.width).toBe('40%');
      expect(column.align).toBe('left');
      expect(column.value!(order)).toBe('Preparado');
    });

    it('should display unknown status as is', () => {
      // Arrange
      const column = component.orderColumns[1];
      const order: ShipmentOrder = { id: 123, status: 'UnknownStatus' };

      // Assert
      expect(column.value!(order)).toBe('UnknownStatus');
    });
  });

  describe('ngOnInit', () => {
    it('should fetch shipment detail and set data', () => {
      // Arrange
      component.shipmentId = mockDetail.id;
      shipmentService.getShipmentById.mockReturnValue(of(mockDetail));

      // Act
      component.ngOnInit();

      // Assert
      expect(shipmentService.getShipmentById).toHaveBeenCalledWith(
        mockDetail.id,
      );
      expect(component.data()).toEqual(mockDetail);
      expect(component.isLoading()).toBe(false);
    });

    it('should set isLoading to false on error', () => {
      // Arrange
      component.shipmentId = mockDetail.id;
      shipmentService.getShipmentById.mockReturnValue(
        throwError(() => new Error('error')),
      );

      // Act
      component.ngOnInit();

      // Assert
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('getStatusLabel', () => {
    it('should return the correct label for a known status', () => {
      // Arrange
      const status = statusOptions[1].key;
      const expectedLabel = statusOptions[1].value;

      // Act
      const label = component.getStatusLabel(status);

      // Assert
      expect(label).toBe(expectedLabel);
    });

    it('should return the status itself for an unknown status', () => {
      // Arrange
      const unknownStatus = 'UnknownStatus';

      // Act
      const label = component.getStatusLabel(unknownStatus);

      // Assert
      expect(label).toBe(unknownStatus);
    });
  });

  describe('getOrderStatusLabel', () => {
    it('should return the correct label for a known order status', () => {
      // Arrange
      const status = 'Prepared';
      const expectedLabel = 'Preparado';

      // Act
      const label = component.getOrderStatusLabel(status);

      // Assert
      expect(label).toBe(expectedLabel);
    });

    it('should return the status itself for an unknown order status', () => {
      // Arrange
      const unknownStatus = 'UnknownOrderStatus';

      // Act
      const label = component.getOrderStatusLabel(unknownStatus);

      // Assert
      expect(label).toBe(unknownStatus);
    });
  });

  describe('orderDataSource$', () => {
    it('should emit the orders from data', (done) => {
      // Arrange
      const orders = [
        { id: 1, status: 'Prepared' },
        { id: 2, status: 'Pending' },
      ];
      component.data.set({ ...mockDetail, orders });

      // Act & Assert
      component.orderDataSource$.pipe(take(1)).subscribe((result) => {
        expect(result).toEqual(orders);
        done();
      });
    });

    it('should emit an empty array if data or orders is undefined', (done) => {
      // Arrange
      component.data.set(null);

      // Act & Assert
      component.orderDataSource$.pipe(take(1)).subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });
    });
  });
});
