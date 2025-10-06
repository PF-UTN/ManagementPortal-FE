import { VehicleService } from '@Common';

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { CreateVehicleDrawerComponent } from './create-vehicle-drawer.component';
import { VehicleListItem } from '../../../../../common/src/models/vehicle/vehicle-item.model';

describe('CreateVehicleDrawerComponent', () => {
  let component: CreateVehicleDrawerComponent;
  let fixture: ComponentFixture<CreateVehicleDrawerComponent>;
  let vehicleServiceMock: {
    createVehicleAsync: jest.Mock;
    updateVehicleAsync: jest.Mock;
  };
  let snackBarMock: { open: jest.Mock };

  beforeEach(async () => {
    vehicleServiceMock = {
      createVehicleAsync: jest.fn(),
      updateVehicleAsync: jest.fn(),
    };
    snackBarMock = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        CreateVehicleDrawerComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: VehicleService, useValue: vehicleServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateVehicleDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should be invalid when required fields are empty', () => {
      // Act
      const valid = component.form.valid;
      // Assert
      expect(valid).toBe(false);
    });

    it('should be valid when all required fields are filled', () => {
      // Arrange
      component.form.patchValue({
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 10000,
        admissionDate: new Date('2025-07-19'),
        enabled: true,
        deleted: false,
      });
      // Act
      const valid = component.form.valid;
      // Assert
      expect(valid).toBe(true);
    });

    it('should be invalid and show maxYear error when admissionDate year is greater than 9999', () => {
      // Arrange
      component.form.patchValue({
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 10000,
        admissionDate: new Date('10000-01-01'),
        enabled: true,
        deleted: false,
      });
      // Act
      const valid = component.form.valid;
      // Assert
      expect(valid).toBe(false);
      expect(component.form.get('admissionDate')?.hasError('maxYear')).toBe(
        true,
      );
    });
  });

  describe('onSubmit', () => {
    it('should call createVehicleAsync and show success snackbar on success', fakeAsync(() => {
      // Arrange
      component.form.patchValue({
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 10000,
        admissionDate: new Date('2025-07-19'),
        enabled: true,
        deleted: false,
      });
      vehicleServiceMock.createVehicleAsync.mockReturnValue(of({}));
      // Act
      component.onSubmit();
      tick();
      // Assert
      expect(vehicleServiceMock.createVehicleAsync).toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Vehículo creado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
    }));

    it('should handle error when license plate exists', fakeAsync(() => {
      // Arrange
      component.form.patchValue({
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 10000,
        admissionDate: new Date('2025-07-19'),
        enabled: true,
        deleted: false,
      });
      vehicleServiceMock.createVehicleAsync.mockReturnValue(
        throwError(() => ({
          error: {
            message: 'Vehicle with license plate ABC123 already exists.',
          },
        })),
      );
      // Act
      component.onSubmit();
      tick();
      // Assert
      expect(vehicleServiceMock.createVehicleAsync).toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Ya existe un vehículo con esa patente.',
        'Cerrar',
        { duration: 5000 },
      );
      expect(component.form.get('licensePlate')?.hasError('exists')).toBe(true);
    }));

    it('should handle generic error', fakeAsync(() => {
      // Arrange
      component.form.patchValue({
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 10000,
        admissionDate: new Date('2025-07-19'),
        enabled: true,
        deleted: false,
      });
      vehicleServiceMock.createVehicleAsync.mockReturnValue(
        throwError(() => ({
          error: { message: 'Other error' },
        })),
      );
      // Act
      component.onSubmit();
      tick();
      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Error al crear el vehículo.',
        'Cerrar',
        { duration: 5000 },
      );
    }));

    it('should call updateVehicleAsync and show success snackbar on edit', fakeAsync(() => {
      // Arrange
      const updateSpy = jest.fn().mockReturnValue(of({}));
      component['vehicleService'].updateVehicleAsync = updateSpy;

      component.data = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 10000,
        admissionDate: '2024-07-31T00:00:00.000Z',
        enabled: true,
      };

      component.ngOnInit();
      component.form.patchValue({
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 25000,
        admissionDate: new Date('1990-01-15'),
        enabled: true,
      });

      // Act
      component.onSubmit();
      tick();

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(1, {
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 25000,
        admissionDate: '1990-01-15',
        enabled: true,
      });
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Vehículo actualizado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
    }));

    it('should patch admissionDate as Date when data.admissionDate is a string', () => {
      // Arrange
      component.data = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 10000,
        admissionDate: '2025-07-31T00:00:00.000Z',
        enabled: true,
      };

      // Act
      component.ngOnInit();

      // Assert
      expect(component.form.value.admissionDate).toEqual(
        new Date('2025-07-31'),
      );
    });

    it('should patch enabled as false when data.enabled is undefined', () => {
      // Arrange
      component.data = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 10000,
        admissionDate: new Date('2025-07-19'),
        deleted: false,
        enabled: undefined,
      } as unknown as VehicleListItem;

      // Act
      component.ngOnInit();

      // Assert
      expect(component.form.value.enabled).toBe(false);
    });

    it('should not call createVehicleAsync or updateVehicleAsync if form is invalid', () => {
      // Arrange
      component.form.patchValue({
        licensePlate: '',
        brand: '',
        model: '',
        kmTraveled: null,
        admissionDate: null,
        enabled: null,
        deleted: null,
      });

      const createSpy = jest.spyOn(
        component['vehicleService'],
        'createVehicleAsync',
      );
      const updateSpy = jest.spyOn(
        component['vehicleService'],
        'updateVehicleAsync',
      );
      const loadingSpy = jest.spyOn(component.isLoading, 'set');

      // Act
      component.onSubmit();

      // Assert
      expect(createSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(loadingSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('licensePlate uppercase', () => {
    it('should convert licensePlate to uppercase on valueChanges', () => {
      // Arrange
      const control = component.form.get('licensePlate');
      control?.setValue('abc123');
      // Act && Assert
      expect(control?.value).toBe('ABC123');
    });
  });
});
