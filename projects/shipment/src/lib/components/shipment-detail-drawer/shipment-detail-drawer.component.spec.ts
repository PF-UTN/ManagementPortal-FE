import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ShipmentDetailDrawerComponent } from './shipment-detail-drawer.component';
import { ShipmentDetail } from '../../models/shipment-deatil.model';
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
      kmTraveled: 0,
    },
    status: 'Shipped',
    orders: [
      { id: 1, status: 'pending' },
      { id: 2, status: 'pending' },
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
});
