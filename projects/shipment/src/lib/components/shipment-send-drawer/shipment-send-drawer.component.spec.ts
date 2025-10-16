import { OrderService } from '@Common';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject, throwError } from 'rxjs';

import { ShipmentSendDrawerComponent } from './shipment-send-drawer.component';
import { ShipmentDetail } from '../../models/shipment-deatil.model';
import { ShipmentService } from '../../services/shipment.service';

describe('ShipmentSendDrawerComponent', () => {
  let component: ShipmentSendDrawerComponent;
  let fixture: ComponentFixture<ShipmentSendDrawerComponent>;
  let shipmentService: jest.Mocked<ShipmentService>;
  let snackBar: jest.Mocked<MatSnackBar>;
  let detail: ShipmentDetail;
  let orderService: jest.Mocked<OrderService>;

  beforeEach(async () => {
    shipmentService = {
      getShipmentById: jest.fn(),
      sendShipment: jest.fn(),
    } as unknown as jest.Mocked<ShipmentService>;

    orderService = {
      updateOrderStatus: jest.fn().mockReturnValue(of(void 0)),
    } as unknown as jest.Mocked<OrderService>;

    snackBar = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    detail = {
      id: 1,
      orders: [
        { id: 1, status: 'Pending' },
        { id: 2, status: 'Pending' },
        { id: 3, status: 'Pending' },
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
        { provide: OrderService, useValue: orderService },
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
        ...detail,
        orders: [
          { id: 1, status: 'Prepared' },
          { id: 2, status: 'Prepared' },
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
        ...detail,
        orders: [
          { id: 1, status: 'Prepared' },
          { id: 2, status: 'Pending' },
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
        ...detail,
        orders: [
          { id: 1, status: 'Prepared' },
          { id: 2, status: 'Prepared' },
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
        ...detail,
        orders: [
          { id: 1, status: 'Prepared' },
          { id: 2, status: 'Pending' },
        ],
      } as ShipmentDetail);
      component.orderStates.set({ 1: true, 2: false });

      // Act
      const result = component.allOrdersChecked();

      // Assert
      expect(result).toBe(false);
    });

    it('should set orderUpdatingIds and buttonLoading while update is in-flight', () => {
      // Arrange
      const subj = new Subject<void>();
      orderService.updateOrderStatus.mockReturnValue(subj.asObservable());
      component.data.set(detail);
      component.orderStates.set({});

      const rows = [{ id: 10, selected: true }];

      // Act
      component.onSelectedRows(rows);

      // Assert
      expect(component.orderUpdatingIds()[10]).toBe(true);
      expect(component.buttonLoading()).toBe(true);
      subj.next();
      subj.complete();
      expect(component.orderUpdatingIds()[10]).toBeUndefined();
      expect(component.buttonLoading()).toBe(false);
      expect(component.orderLockedIds()[10]).toBe(true);
    });

    it('should clear updating flag and revert selection on error (in-flight scenario)', () => {
      // Arrange
      const subj = new Subject<void>();
      orderService.updateOrderStatus.mockReturnValue(subj.asObservable());
      component.data.set(detail);
      component.orderStates.set({});

      const rows = [{ id: 11, selected: true }];

      // Act
      component.onSelectedRows(rows);

      // Assert
      expect(component.orderUpdatingIds()[11]).toBe(true);
      expect(component.orderStates()[11]).toBe(true);
      subj.error(new Error('fail'));
      expect(component.orderUpdatingIds()[11]).toBeUndefined();
      expect(component.orderStates()[11]).toBe(false);
    });

    it('should handle multiple concurrent updates independently', () => {
      // Arrange
      const subjA = new Subject<void>();
      const subjB = new Subject<void>();
      orderService.updateOrderStatus.mockImplementation((orderId: number) =>
        orderId === 20 ? subjA.asObservable() : subjB.asObservable(),
      );
      component.data.set(detail);
      component.orderStates.set({});

      const rows = [
        { id: 20, selected: true },
        { id: 21, selected: true },
      ];

      // Act
      component.onSelectedRows([rows[0]]);
      component.onSelectedRows([rows[1]]);

      // Assert
      expect(component.orderUpdatingIds()[20]).toBe(true);
      expect(component.orderUpdatingIds()[21]).toBe(true);
      subjA.next();
      subjA.complete();

      expect(component.orderUpdatingIds()[20]).toBeUndefined();
      expect(component.orderUpdatingIds()[21]).toBe(true);
      subjB.next();
      subjB.complete();

      expect(component.orderUpdatingIds()[21]).toBeUndefined();
      expect(component.orderLockedIds()[20]).toBe(true);
      expect(component.orderLockedIds()[21]).toBe(true);
    });
  });
});
