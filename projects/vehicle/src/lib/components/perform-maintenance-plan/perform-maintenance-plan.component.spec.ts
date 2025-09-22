import { Location } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PerformMaintenancePlanComponent } from './perform-maintenance-plan.component';
import { SupplierSearchResult } from '../../models/supplier-search-response-model';
import { VehicleService } from '../../services/vehicle.service';

describe('PerformMaintenancePlanComponent', () => {
  let component: PerformMaintenancePlanComponent;
  let fixture: ComponentFixture<PerformMaintenancePlanComponent>;
  let vehicleServiceMock: {
    getVehicleById: jest.Mock;
    searchServiceSuppliers: jest.Mock;
    createMaintenanceAsync: jest.Mock;
  };
  let snackBarMock: { open: jest.Mock };
  let locationMock: { back: jest.Mock };

  beforeEach(async () => {
    vehicleServiceMock = {
      getVehicleById: jest.fn().mockReturnValue(of({ kmTraveled: 0 })),
      searchServiceSuppliers: jest.fn(),
      createMaintenanceAsync: jest.fn(),
    };
    snackBarMock = { open: jest.fn() };
    locationMock = { back: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [PerformMaintenancePlanComponent, NoopAnimationsModule],
      providers: [
        { provide: VehicleService, useValue: vehicleServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: Location, useValue: locationMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'vehicleId' ? '1' : '2'),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerformMaintenancePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      // Arrange, Act & Assert
      expect(component).toBeTruthy();
    });

    it('should set vehicleId and maintenancePlanItemId from route params', () => {
      // Arrange, Act
      // Assert
      expect(component.vehicleId).toBe(1);
      expect(component.maintenancePlanItemId).toBe(2);
    });

    it('should set kmTraveled and update kmPerformed validators after loading vehicle', () => {
      // Arrange
      vehicleServiceMock.getVehicleById.mockReturnValue(
        of({ kmTraveled: 1234 }),
      );
      // Act
      component.ngOnInit();
      // Assert
      expect(component.kmTraveled).toBe(1234);
      expect(
        component.maintenanceForm.controls.kmPerformed.validator,
      ).toBeDefined();
    });
  });

  describe('Supplier Autocomplete', () => {
    it('should call searchServiceSuppliers when supplier input changes', fakeAsync(() => {
      // Arrange
      vehicleServiceMock.searchServiceSuppliers.mockReturnValue(
        of({ results: [], total: 0 }),
      );
      // Act
      const sub = component.filteredSuppliers$.subscribe();
      component.maintenanceForm.controls.supplier.setValue(
        'test' as unknown as SupplierSearchResult,
      );
      tick(250); // Avanza el tiempo para pasar el debounceTime
      // Assert
      const calls = vehicleServiceMock.searchServiceSuppliers.mock.calls;
      expect(calls).toEqual(
        expect.arrayContaining([
          [
            {
              searchText: 'test',
              page: 1,
              pageSize: 10,
            },
          ],
        ]),
      );
      sub.unsubscribe(); // Limpia la suscripción
    }));

    it('should add CREATE_SUPPLIER_OPTION as last option in the supplier list', (done) => {
      // Arrange
      vehicleServiceMock.searchServiceSuppliers.mockReturnValue(
        of({ results: [{ id: 5, businessName: 'Proveedor' }], total: 1 }),
      );
      // Act
      component.maintenanceForm.controls.supplier.setValue(
        'string' as unknown as SupplierSearchResult,
      );
      component.filteredSuppliers$.subscribe((list) => {
        // Assert
        expect(list[list.length - 1]).toEqual(component.CREATE_SUPPLIER_OPTION);
        done();
      });
    });

    it('should call onCreateSupplierClick and reset supplier when CREATE_SUPPLIER_OPTION is selected', () => {
      // Arrange
      const spy = jest.spyOn(component, 'onCreateSupplierClick');
      // Act
      component.maintenanceForm.controls.supplier.setValue(
        component.CREATE_SUPPLIER_OPTION,
      );
      component.onSupplierSelected({
        option: { value: component.CREATE_SUPPLIER_OPTION },
      } as unknown as import('@angular/material/autocomplete').MatAutocompleteSelectedEvent);
      // Assert
      expect(spy).toHaveBeenCalled();
      expect(component.maintenanceForm.controls.supplier.value).toBeNull();
    });

    it('should patch supplier when a valid supplier is selected', () => {
      // Arrange
      const supplier = { id: 10, businessName: 'Proveedor' };
      // Act
      component.onSupplierSelected({
        option: { value: supplier },
      } as unknown as import('@angular/material/autocomplete').MatAutocompleteSelectedEvent);
      // Assert
      expect(component.maintenanceForm.controls.supplier.value).toEqual(
        supplier,
      );
    });
  });

  describe('Validation', () => {
    it('should mark kmPerformed as invalid if less than or equal to kmTraveled', () => {
      // Arrange
      component.kmTraveled = 1000;
      component.maintenanceForm.controls.kmPerformed.setValidators([
        Validators.required,
        Validators.min(component.kmTraveled),
      ]);
      component.maintenanceForm.controls.kmPerformed.setValue(900);
      // Act
      component.maintenanceForm.controls.kmPerformed.updateValueAndValidity();
      // Assert
      expect(
        component.maintenanceForm.controls.kmPerformed.hasError('min'),
      ).toBe(true);
    });

    it('should mark supplier as invalid if not an object or is CREATE_SUPPLIER_OPTION', () => {
      // Arrange
      component.maintenanceForm.controls.supplier.setValue(
        'string' as unknown as SupplierSearchResult,
      );
      // Act & Assert
      expect(
        component.maintenanceForm.controls.supplier.hasError('invalidSupplier'),
      ).toBe(true);
      // Arrange
      component.maintenanceForm.controls.supplier.setValue(
        component.CREATE_SUPPLIER_OPTION,
      );
      // Act & Assert
      expect(
        component.maintenanceForm.controls.supplier.hasError('invalidSupplier'),
      ).toBe(true);
    });
  });

  describe('Save', () => {
    it('should not call service if form is invalid', () => {
      // Arrange
      component.maintenanceForm.controls.date.setValue(null);
      // Act
      component.onSave();
      // Assert
      expect(vehicleServiceMock.createMaintenanceAsync).not.toHaveBeenCalled();
    });

    it('should call createMaintenanceAsync and show success message on success', () => {
      // Arrange
      component.kmTraveled = 1000;
      component.maintenanceForm.controls.date.setValue('2025-10-01');
      component.maintenanceForm.controls.kmPerformed.setValue(2001);
      component.maintenanceForm.controls.supplier.setValue({
        id: 2,
        businessName: 'Proveedor',
      });
      vehicleServiceMock.createMaintenanceAsync.mockReturnValue(of({}));
      // Act
      component.onSave();
      // Assert
      expect(vehicleServiceMock.createMaintenanceAsync).toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Mantenimiento realizado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
      expect(locationMock.back).toHaveBeenCalled();
    });

    it('should show error message if createMaintenanceAsync fails', () => {
      // Arrange
      component.kmTraveled = 1000;
      component.maintenanceForm.controls.date.setValue('2025-10-01');
      component.maintenanceForm.controls.kmPerformed.setValue(2001);
      component.maintenanceForm.controls.supplier.setValue({
        id: 2,
        businessName: 'Proveedor',
      });
      vehicleServiceMock.createMaintenanceAsync.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      // Act
      component.onSave();
      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Ocurrió un error al realizar el mantenimiento',
        'Cerrar',
        { duration: 3000 },
      );
    });
  });
});
