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
import { VehicleService } from '../../services/vehicle.service';

describe('CreateVehicleDrawerComponent', () => {
  let component: CreateVehicleDrawerComponent;
  let fixture: ComponentFixture<CreateVehicleDrawerComponent>;
  let vehicleServiceMock: { createVehicleAsync: jest.Mock };
  let snackBarMock: { open: jest.Mock };

  beforeEach(async () => {
    vehicleServiceMock = {
      createVehicleAsync: jest.fn(),
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
        admissionDate: '2025-07-19',
        enabled: true,
        deleted: false,
      });
      // Act
      const valid = component.form.valid;
      // Assert
      expect(valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not call createVehicleAsync if form is invalid', () => {
      // Arrange
      component.form.patchValue({ licensePlate: '' }); // invalid
      // Act
      component.onSubmit();
      // Assert
      expect(vehicleServiceMock.createVehicleAsync).not.toHaveBeenCalled();
    });

    it('should call createVehicleAsync and show success snackbar on success', fakeAsync(() => {
      // Arrange
      component.form.patchValue({
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 10000,
        admissionDate: '2025-07-19',
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
        admissionDate: '2025-07-19',
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
        admissionDate: '2025-07-19',
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
  });

  describe('clearText', () => {
    it('should clear the input value and mark as pristine/untouched', () => {
      // Arrange
      component.form.get('brand')?.setValue('Toyota');
      component.form.get('brand')?.markAsDirty();
      component.form.get('brand')?.markAsTouched();
      // Act
      component.clearText('brand');
      // Assert
      expect(component.form.get('brand')?.value).toBe('');
      expect(component.form.get('brand')?.pristine).toBe(true);
      expect(component.form.get('brand')?.touched).toBe(false);
    });
  });

  describe('licensePlate uppercase', () => {
    it('should convert licensePlate to uppercase on valueChanges', () => {
      // Arrange
      const control = component.form.get('licensePlate');
      control?.setValue('abc123');
      // Act
      // valueChanges already triggers in ngOnInit
      // Assert
      expect(control?.value).toBe('ABC123');
    });
  });
});
