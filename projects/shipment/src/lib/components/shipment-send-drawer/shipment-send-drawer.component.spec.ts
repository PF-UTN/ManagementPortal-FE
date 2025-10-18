import { OrderService } from '@Common';
import { LateralDrawerService } from '@Common-UI';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject, throwError } from 'rxjs';

import { ShipmentSendDrawerComponent } from './shipment-send-drawer.component';
import { ShipmentDetail } from '../../models/shipment-deatil.model';
import { statusOptions } from '../../models/shipment-status-option.model';
import { ShipmentService } from '../../services/shipment.service';

describe('ShipmentSendDrawerComponent', () => {
  let component: ShipmentSendDrawerComponent;
  let fixture: ComponentFixture<ShipmentSendDrawerComponent>;
  let shipmentService: jest.Mocked<ShipmentService>;
  let snackBar: jest.Mocked<MatSnackBar>;
  let detail: ShipmentDetail;
  let orderService: jest.Mocked<OrderService>;
  let lateralDrawerService: jest.Mocked<LateralDrawerService>;

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

    lateralDrawerService = {
      config: {},
      updateConfig: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<LateralDrawerService>;

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
        { provide: LateralDrawerService, useValue: lateralDrawerService },
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

    it('should call lateralDrawerService.updateConfig with footer buttons', () => {
      // Arrange & Act
      const lastCallArg = lateralDrawerService.updateConfig.mock.calls.slice(
        -1,
      )[0]?.[0] as Partial<Record<string, unknown>> | undefined;

      // Assert
      expect(lastCallArg).toBeDefined();
      type FooterShape = {
        firstButton?: { text?: string; click?: () => void; disabled?: boolean };
        secondButton?: { text?: string };
      };
      const footer = (lastCallArg as { footer?: unknown })?.footer as
        | FooterShape
        | undefined;
      expect(footer).toBeDefined();
      expect(footer!.firstButton).toBeDefined();
      expect(footer!.firstButton!.text).toBe('Enviar');
      expect(footer!.secondButton).toBeDefined();
      expect(footer!.secondButton!.text).toBe('Cerrar');
    });

    it('firstButton.click should call confirmSendShipment -> sendShipment and show snackbar', () => {
      // Arrange
      component.shipmentId = 123;
      shipmentService.sendShipment.mockReturnValue(of({ link: 'test' }));
      const cfg = lateralDrawerService.updateConfig.mock.calls.slice(
        -1,
      )[0]?.[0] as Partial<Record<string, unknown>> | undefined;
      expect(cfg).toBeDefined();
      const footer = (cfg as { footer?: unknown })?.footer as
        | {
            firstButton?: { click?: () => void };
          }
        | undefined;
      expect(footer).toBeDefined();
      expect(footer!.firstButton).toBeDefined();
      const clickFn = footer!.firstButton!.click as () => void;

      // Act
      clickFn();

      // Assert
      expect(shipmentService.sendShipment).toHaveBeenCalledWith(123);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Envío iniciado con éxito',
        'Cerrar',
        { duration: 3000 },
      );
      expect(component.buttonLoading()).toBe(false);
    });

    it('getStatusLabel should return mapped value from statusOptions when key matches', () => {
      // Arrange
      const opt = statusOptions[0];

      // Act
      const result = component.getStatusLabel(opt.key);

      // Assert
      expect(result).toBe(opt.value);
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

    it('should initialize orderLockedIds for Prepared orders on ngOnInit', () => {
      // Arrange
      const preparedDetail: ShipmentDetail = {
        ...detail,
        orders: [{ id: 99, status: 'Prepared' }],
      } as ShipmentDetail;
      shipmentService.getShipmentById.mockReturnValue(of(preparedDetail));
      component.shipmentId = 1;

      // Act
      component.ngOnInit();

      // Assert
      expect(component.orderLockedIds()[99]).toBe(true);
    });

    it('completed column disabled when order.status === "Prepared"', () => {
      // Arrange
      const completedCol = component.orderTableColumns.find(
        (c) => c.columnDef === 'completed',
      )!;
      const orderItem = {
        id: 2,
        status: 'Prepared',
        completed: false,
        selected: true,
      };

      // Act
      const disabled =
        typeof completedCol.disabled === 'function'
          ? completedCol.disabled(orderItem)
          : !!completedCol.disabled;

      // Assert
      expect(disabled).toBe(true);
    });

    it('completed column disabled when order is updating (orderUpdatingIds flag)', () => {
      // Arrange
      const completedCol = component.orderTableColumns.find(
        (c) => c.columnDef === 'completed',
      )!;
      component.orderUpdatingIds.set({ 55: true });
      const orderItem = {
        id: 55,
        status: 'Pending',
        completed: false,
        selected: false,
      };

      // Act
      const disabled =
        typeof completedCol.disabled === 'function'
          ? completedCol.disabled(orderItem)
          : !!completedCol.disabled;

      // Assert
      expect(disabled).toBe(true);
    });

    it('completed column disabled when order is locked (orderLockedIds flag)', () => {
      // Arrange
      const completedCol = component.orderTableColumns.find(
        (c) => c.columnDef === 'completed',
      )!;
      component.orderLockedIds.set({ 77: true });
      const orderItem = {
        id: 77,
        status: 'Pending',
        completed: false,
        selected: false,
      };

      // Act
      const disabled =
        typeof completedCol.disabled === 'function'
          ? completedCol.disabled(orderItem)
          : !!completedCol.disabled;

      // Assert
      expect(disabled).toBe(true);
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
