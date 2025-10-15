import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { ShipmentSendDrawerComponent } from './shipment-send-drawer.component';
import { ShipmentDetail } from '../../models/shipment-deatil.model';
import { ShipmentService } from '../../services/shipment.service';

describe('ShipmentSendDrawerComponent', () => {
  let component: ShipmentSendDrawerComponent;
  let fixture: ComponentFixture<ShipmentSendDrawerComponent>;
  let shipmentService: jest.Mocked<ShipmentService>;
  let snackBar: jest.Mocked<MatSnackBar>;
  let detail: ShipmentDetail;

  beforeEach(async () => {
    shipmentService = {
      getShipmentById: jest.fn(),
      sendShipment: jest.fn(),
    } as unknown as jest.Mocked<ShipmentService>;

    snackBar = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    detail = {
      id: 1,
      orders: [
        { id: 1, status: 'pending' },
        { id: 2, status: 'pending' },
        { id: 3, status: 'pending' },
      ],
      date: '',
      estimatedKm: 0,
      effectiveKm: 0,
      finishedAt: '',
      status: '',
      vehicle: {
        id: 1,
        licensePlate: '',
        brand: '',
        model: '',
        kmTraveled: 0,
      },
      routeLink: '',
    };

    shipmentService.getShipmentById.mockReturnValue(of(detail));

    await TestBed.configureTestingModule({
      imports: [ShipmentSendDrawerComponent],
      providers: [
        { provide: ShipmentService, useValue: shipmentService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentSendDrawerComponent);
    component = fixture.componentInstance;
    component.shipmentId = 1;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      // Arrange & Act
      // Assert
      expect(component).toBeTruthy();
    });

    it('should set data and isLoading=false on ngOnInit success', () => {
      // Arrange
      shipmentService.getShipmentById.mockReturnValue(of(detail));
      component.shipmentId = 1;

      // Act
      component.ngOnInit();

      // Assert
      expect(component.data()).toEqual(detail);
      expect(component.isLoading()).toBe(false);
    });

    it('should set isLoading=false on ngOnInit error', () => {
      // Arrange
      shipmentService.getShipmentById.mockReturnValue(
        throwError(() => new Error('error')),
      );
      component.shipmentId = 1;

      // Act
      component.ngOnInit();

      // Assert
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Order selection', () => {
    it('should update orderStates on onSelectedRows', () => {
      // Arrange
      const rows = [
        { id: 1, selected: true },
        { id: 2, selected: false },
      ];

      // Act
      component.onSelectedRows(rows);

      // Assert
      expect(component.orderStates()).toEqual({ 1: true, 2: false });
    });

    it('should return true from allOrdersChecked if all selected', () => {
      // Arrange
      component.data.set({
        id: 1,
        orders: [
          { id: 1, status: 'pending' },
          { id: 2, status: 'pending' },
        ],
      } as ShipmentDetail);
      component.orderStates.set({ 1: true, 2: true });

      // Act
      const result = component.allOrdersChecked();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false from allOrdersChecked if not all selected', () => {
      // Arrange
      component.data.set({
        id: 1,
        orders: [
          { id: 1, status: 'pending' },
          { id: 2, status: 'pending' },
        ],
      } as ShipmentDetail);
      component.orderStates.set({ 1: true, 2: false });

      // Act
      const result = component.allOrdersChecked();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Send shipment', () => {
    it('should call sendShipment and show snackbar on confirmSendShipment success', () => {
      // Arrange
      component.shipmentId = 1;
      shipmentService.sendShipment.mockReturnValue(of({ link: 'test' }));

      // Act
      component.confirmSendShipment();

      // Assert
      expect(shipmentService.sendShipment).toHaveBeenCalledWith(1);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Envío iniciado con éxito',
        'Cerrar',
        { duration: 3000 },
      );
      expect(component.buttonLoading()).toBe(false);
    });

    it('should show error snackbar on confirmSendShipment error', () => {
      // Arrange
      component.shipmentId = 1;
      shipmentService.sendShipment.mockReturnValue(
        throwError(() => new Error('error')),
      );

      // Act
      component.confirmSendShipment();

      // Assert
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error al iniciar el envío',
        'Cerrar',
        { duration: 3000 },
      );
      expect(component.buttonLoading()).toBe(false);
    });
  });
});
