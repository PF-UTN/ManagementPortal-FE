import { VehicleService, VehicleListItem } from '@Common';
import { LateralDrawerService } from '@Common-UI';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { CreateShipmentDrawerComponent } from './create-shipment-drawer.component';
import { OrderService } from '../../services/order.service';

describe('CreateShipmentDrawerComponent', () => {
  let component: CreateShipmentDrawerComponent;
  let fixture: ComponentFixture<CreateShipmentDrawerComponent>;
  let vehicleService: jest.Mocked<VehicleService>;
  let orderService: jest.Mocked<OrderService>;
  let lateralDrawerService: jest.Mocked<LateralDrawerService>;
  let snackBar: jest.Mocked<MatSnackBar>;

  beforeEach(async () => {
    vehicleService = {
      postSearchVehiclesAsync: jest.fn(),
    } as unknown as jest.Mocked<VehicleService>;

    orderService = {
      createShipment: jest.fn(),
    } as unknown as jest.Mocked<OrderService>;

    lateralDrawerService = {
      close: jest.fn(),
      updateConfig: jest.fn(),
      config: {},
    } as unknown as jest.Mocked<LateralDrawerService>;

    snackBar = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [CreateShipmentDrawerComponent, NoopAnimationsModule],
      providers: [
        { provide: VehicleService, useValue: vehicleService },
        { provide: OrderService, useValue: orderService },
        { provide: LateralDrawerService, useValue: lateralDrawerService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateShipmentDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should initialize the form and set today', () => {
      // Arrange

      // Act
      component.ngOnInit();

      // Assert
      expect(component.shipmentForm).toBeDefined();
      expect(component.today).toBeInstanceOf(Date);
    });
  });

  describe('onCreate', () => {
    it('should not proceed if the form is invalid', () => {
      // Arrange
      component.shipmentForm.controls.date.setValue(null);
      component.shipmentForm.controls.vehicle.setValue(null);

      // Act
      component.onCreate();

      // Assert
      expect(orderService.createShipment).not.toHaveBeenCalled();
    });

    it('should call createShipment and show success snackbar on success', () => {
      // Arrange
      component.shipmentForm.controls.date.setValue(new Date());
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: '',
        model: '',
        kmTraveled: 0,
        enabled: true,
        admissionDate: '',
      };
      component.shipmentForm.controls.vehicle.setValue(vehicle);
      component.selectedOrders = [{ id: 1 }];
      orderService.createShipment.mockReturnValue(of(undefined));

      // Act
      component.onCreate();

      // Assert
      expect(orderService.createShipment).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Envío creado con éxito',
        'Cerrar',
        { duration: 3000 },
      );
    });

    it('should handle error and not show success snackbar', () => {
      // Arrange
      component.shipmentForm.controls.date.setValue(new Date());
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: '',
        model: '',
        kmTraveled: 0,
        enabled: true,
        admissionDate: '',
      };
      component.shipmentForm.controls.vehicle.setValue(vehicle);
      component.selectedOrders = [{ id: 1 }];
      orderService.createShipment.mockReturnValue(
        throwError(() => new Error('error')),
      );

      // Act
      component.onCreate();

      // Assert
      expect(orderService.createShipment).toHaveBeenCalled();
      expect(snackBar.open).not.toHaveBeenCalledWith(
        'Envío creado con éxito',
        'Cerrar',
        { duration: 3000 },
      );
    });
  });

  describe('displayVehicle', () => {
    it('should return license plate if vehicle is defined', () => {
      // Arrange
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'XYZ789',
        brand: '',
        model: '',
        kmTraveled: 0,
        enabled: true,
        admissionDate: '',
      };

      // Act
      const result = component.displayVehicle(vehicle);

      // Assert
      expect(result).toBe('XYZ789');
    });

    it('should return empty string if vehicle is undefined', () => {
      // Arrange
      // Act
      const result = component.displayVehicle(
        undefined as unknown as VehicleListItem,
      );

      // Assert
      expect(result).toBe('');
    });
  });

  describe('vehicleObjectValidator', () => {
    it('should return null if value is a valid vehicle object', () => {
      // Arrange
      const validator = component.vehicleObjectValidator();
      const control = new FormControl({ id: 1 });

      // Act
      const result = validator(control);

      // Assert
      expect(result).toBeNull();
    });

    it('should return error if value is not a valid vehicle object', () => {
      // Arrange
      const validator = component.vehicleObjectValidator();
      const control = new FormControl('string');

      // Act
      const result = validator(control);

      // Assert
      expect(result).toEqual({ invalidVehicle: true });
    });
  });
});
