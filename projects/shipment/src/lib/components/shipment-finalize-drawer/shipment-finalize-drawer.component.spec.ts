import { LateralDrawerService } from '@Common-UI';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { ShipmentFinalizeDrawerComponent } from './shipment-finalize-drawer.component';
import { ShipmentDetail } from '../../models/shipment-deatil.model';
import { ShipmentService } from '../../services/shipment.service';

describe('ShipmentFinalizeDrawerComponent', () => {
  let component: ShipmentFinalizeDrawerComponent;
  let fixture: ComponentFixture<ShipmentFinalizeDrawerComponent>;
  let shipmentServiceMock: jest.Mocked<ShipmentService>;
  let lateralDrawerServiceMock: jest.Mocked<LateralDrawerService>;
  let snackBarMock: jest.Mocked<MatSnackBar>;
  let fb: FormBuilder;

  const mockShipmentDetail: ShipmentDetail = {
    id: 1,
    date: new Date().toISOString(),
    estimatedKm: 1200,
    effectiveKm: 1100,
    finishedAt: null,
    routeLink: null,
    status: 'pending',
    vehicle: {
      id: 1,
      licensePlate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      kmTraveled: 1000,
    },
    orders: [
      { id: 10, status: 'pending' },
      { id: 11, status: 'completed' },
    ],
  };

  beforeEach(async () => {
    shipmentServiceMock = {
      getShipmentById: jest.fn(),
      finishShipment: jest.fn(),
    } as unknown as jest.Mocked<ShipmentService>;

    lateralDrawerServiceMock = {
      config: {},
      updateConfig: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<LateralDrawerService>;

    snackBarMock = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    fb = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [ShipmentFinalizeDrawerComponent],
      providers: [
        { provide: ShipmentService, useValue: shipmentServiceMock },
        { provide: LateralDrawerService, useValue: lateralDrawerServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: FormBuilder, useValue: fb },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentFinalizeDrawerComponent);
    component = fixture.componentInstance;
    component.shipmentId = 1;
  });

  describe('ngOnInit', () => {
    it('should initialize finalizeForm and set orderChecks and odometer validator', () => {
      // Arrange
      shipmentServiceMock.getShipmentById.mockReturnValue(
        of(mockShipmentDetail),
      );

      // Act
      component.ngOnInit();

      // Assert
      expect(component.finalizeForm).toBeDefined();
      expect(component.finalizeForm.get('orderChecks')?.value.length).toBe(2);
      const odometerControl = component.finalizeForm.get('odometer');
      expect(odometerControl?.validator).toBeDefined();
      expect(component.isLoading()).toBe(false);
    });

    it('should show minOdometer error in finalizeForm when odometer is too low', () => {
      // Arrange
      shipmentServiceMock.getShipmentById.mockReturnValue(
        of(mockShipmentDetail),
      );
      component.ngOnInit();
      const odometerControl = component.finalizeForm.get(
        'odometer',
      ) as FormControl<number | null>;

      // Act
      odometerControl.setValue(999);
      odometerControl.markAsTouched();
      odometerControl.updateValueAndValidity();

      // Assert
      expect(odometerControl.hasError('minOdometer')).toBe(true);
    });
  });

  describe('onOrderCheckChange', () => {
    it('should update the correct orderChecks value', () => {
      // Arrange
      component.data.set(mockShipmentDetail);
      component.finalizeForm = fb.group({
        finishedAt: new FormControl<Date | null>(
          new Date(),
          Validators.required,
        ),
        odometer: new FormControl<number | null>(null, [Validators.required]),
        orderChecks: fb.array([
          new FormControl(true, { nonNullable: true }),
          new FormControl(false, { nonNullable: true }),
        ]),
      });

      // Act
      component.onOrderCheckChange(11, true);

      // Assert
      expect(
        (component.finalizeForm.get('orderChecks') as FormArray).at(1).value,
      ).toBe(true);
    });
  });

  describe('getShipmentStatusLabel', () => {
    it('should return correct label for known status', () => {
      // Arrange
      const status = 'pending';
      // Act
      const label = component.getShipmentStatusLabel(status);
      // Assert
      expect(typeof label).toBe('string');
    });

    it('should return status if not found', () => {
      // Arrange
      const status = 'unknown_status';
      // Act
      const label = component.getShipmentStatusLabel(status);
      // Assert
      expect(label).toBe('unknown_status');
    });
  });

  describe('orderTableItems$', () => {
    it('should emit correct items', (done) => {
      // Arrange
      component.data.set(mockShipmentDetail);
      component.finalizeForm = fb.group({
        finishedAt: new FormControl<Date | null>(
          new Date(),
          Validators.required,
        ),
        odometer: new FormControl<number | null>(null, [Validators.required]),
        orderChecks: fb.array([
          new FormControl(true, { nonNullable: true }),
          new FormControl(false, { nonNullable: true }),
        ]),
      });

      // Act & Assert
      component.orderTableItems$.subscribe((items) => {
        expect(items.length).toBe(2);
        expect(items[0].id).toBe(10);
        expect(items[0].completed).toBe(true);
        expect(items[1].completed).toBe(false);
        done();
      });
    });
  });

  describe('finalizeShipment', () => {
    it('should handle success response', () => {
      // Arrange
      component.data.set(mockShipmentDetail);
      component.finalizeForm = fb.group({
        finishedAt: new FormControl<Date | null>(
          new Date(),
          Validators.required,
        ),
        odometer: new FormControl<number | null>(1001, [Validators.required]),
        orderChecks: fb.array([
          new FormControl(true, { nonNullable: true }),
          new FormControl(false, { nonNullable: true }),
        ]),
      });
      shipmentServiceMock.finishShipment.mockReturnValue(of(undefined)); // <-- Observable de éxito

      // Act
      component.finalizeShipment();

      // Assert
      expect(component.buttonLoading()).toBe(false);
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Envío finalizado con éxito',
        'Cerrar',
        { duration: 3000 },
      );
      expect(lateralDrawerServiceMock.close).toHaveBeenCalled();
    });

    it('should handle error response', () => {
      // Arrange
      component.data.set(mockShipmentDetail);
      component.finalizeForm = fb.group({
        finishedAt: new FormControl<Date | null>(
          new Date(),
          Validators.required,
        ),
        odometer: new FormControl<number | null>(1001, [Validators.required]),
        orderChecks: fb.array([
          new FormControl(true, { nonNullable: true }),
          new FormControl(false, { nonNullable: true }),
        ]),
      });
      shipmentServiceMock.finishShipment.mockReturnValue(
        throwError(() => new Error('error')),
      ); // <-- Observable de error

      // Act
      component.finalizeShipment();

      // Assert
      expect(component.buttonLoading()).toBe(false);
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Error al finalizar el envío',
        'Cerrar',
        { duration: 3000 },
      );
    });
  });

  describe('odometerGreaterThanKmTraveledValidator', () => {
    it('should set minOdometer error if odometer is less than or equal to kmTraveled', () => {
      // Arrange
      const kmTraveled = 1000;
      const validator =
        component.odometerGreaterThanKmTraveledValidator(kmTraveled);
      const control = new FormControl<number | null>(1000);

      // Act
      const error = validator(control);

      // Assert
      expect(error).toEqual({
        minOdometer: { requiredMin: 1001, actual: 1000 },
      });
    });

    it('should not set error if odometer is greater than kmTraveled', () => {
      // Arrange
      const kmTraveled = 1000;
      const validator =
        component.odometerGreaterThanKmTraveledValidator(kmTraveled);
      const control = new FormControl<number | null>(1001);

      // Act
      const error = validator(control);

      // Assert
      expect(error).toBeNull();
    });
  });
});
