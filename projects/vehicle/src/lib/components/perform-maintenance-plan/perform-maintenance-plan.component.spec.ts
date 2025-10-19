import { VehicleService } from '@Common';
import { LateralDrawerService } from '@Common-UI';

import { Location } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PerformMaintenancePlanComponent } from './perform-maintenance-plan.component';
import { SupplierSearchResult } from '../../../../../common/src/models/vehicle/supplier-search-response-model';

describe('PerformMaintenancePlanComponent', () => {
  let component: PerformMaintenancePlanComponent;
  let fixture: ComponentFixture<PerformMaintenancePlanComponent>;
  let vehicleServiceMock: {
    getVehicleById: jest.Mock;
    searchServiceSuppliers: jest.Mock;
    createMaintenanceAsync: jest.Mock;
    updateMaintenance: jest.Mock;
    getSupplierById: jest.Mock;
  };
  let snackBarMock: { open: jest.Mock };
  let locationMock: { back: jest.Mock };
  let lateralDrawerServiceMock: { open: jest.Mock; close: jest.Mock };

  beforeEach(async () => {
    vehicleServiceMock = {
      getVehicleById: jest.fn().mockReturnValue(of({ kmTraveled: 0 })),
      searchServiceSuppliers: jest.fn(),
      createMaintenanceAsync: jest.fn(),
      updateMaintenance: jest.fn(),
      getSupplierById: jest.fn(),
    };
    snackBarMock = { open: jest.fn() };
    locationMock = { back: jest.fn() };

    lateralDrawerServiceMock = {
      open: jest.fn().mockReturnValue(of(undefined)),
      close: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PerformMaintenancePlanComponent, NoopAnimationsModule],
      providers: [
        { provide: VehicleService, useValue: vehicleServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: Location, useValue: locationMock },
        { provide: LateralDrawerService, useValue: lateralDrawerServiceMock },
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

    it('should initialize the form with min(1) validator for kmPerformed', () => {
      // Arrange & Act
      // Assert
      expect(
        component.maintenanceForm.controls.kmPerformed.validator,
      ).toBeDefined();
      component.maintenanceForm.controls.kmPerformed.setValue(0);
      component.maintenanceForm.controls.kmPerformed.updateValueAndValidity();
      expect(
        component.maintenanceForm.controls.kmPerformed.hasError('min'),
      ).toBe(true);
    });

    it('should patch form and fetch supplier if maintenanceFromState exists', () => {
      // Arrange
      const maintenanceMock = {
        id: 123,
        date: '2025-10-01',
        description: 'desc',
        kmPerformed: 1500,
        serviceSupplierId: 42,
      };
      const supplierMock: SupplierSearchResult = {
        id: 42,
        businessName: 'Proveedor Test',
      };
      const originalHistoryState = { ...history.state };
      Object.defineProperty(history, 'state', {
        value: { maintenance: maintenanceMock },
        configurable: true,
      });
      vehicleServiceMock.getSupplierById = jest
        .fn()
        .mockReturnValue(of(supplierMock));

      // Act
      const testFixture = TestBed.createComponent(
        PerformMaintenancePlanComponent,
      );
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      // Assert
      expect(testComponent.maintenanceFromState).toEqual(maintenanceMock);
      expect(testComponent.isLoading).toBe(false);
      expect(testComponent.maintenanceForm.value.date).toBe(
        maintenanceMock.date,
      );
      expect(testComponent.maintenanceForm.value.kmPerformed).toBe(
        maintenanceMock.kmPerformed,
      );
      expect(testComponent.maintenanceForm.value.supplier).toEqual(
        supplierMock,
      );
      Object.defineProperty(history, 'state', {
        value: originalHistoryState,
        configurable: true,
      });
    });

    it('should set isLoading false if getSupplierById fails', () => {
      // Arrange
      const maintenanceMock = {
        id: 123,
        date: '2025-10-01',
        description: 'desc',
        kmPerformed: 1500,
        serviceSupplierId: 42,
      };
      Object.defineProperty(history, 'state', {
        value: { maintenance: maintenanceMock },
        configurable: true,
      });
      vehicleServiceMock.getSupplierById = jest
        .fn()
        .mockReturnValue(throwError(() => new Error('fail')));

      // Act
      const testFixture = TestBed.createComponent(
        PerformMaintenancePlanComponent,
      );
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      // Assert
      expect(testComponent.isLoading).toBe(false);
      Object.defineProperty(history, 'state', {
        value: {},
        configurable: true,
      });
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
      tick(250);
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
      sub.unsubscribe();
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

    it('should call lateralDrawerService.close when Cancelar button is clicked in the drawer', () => {
      // Arrange
      lateralDrawerServiceMock.open.mockImplementation(
        (_comp, _data, config) => {
          config.footer.firstButton.click();
          return of(undefined);
        },
      );

      // Act
      component.onCreateSupplierClick();

      // Assert
      expect(lateralDrawerServiceMock.close).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
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

    it('should mark kmPerformed as invalid if less than 1', () => {
      // Arrange
      component.maintenanceForm.controls.kmPerformed.setValue(0);

      // Act
      component.maintenanceForm.controls.kmPerformed.updateValueAndValidity();

      // Assert
      expect(
        component.maintenanceForm.controls.kmPerformed.hasError('min'),
      ).toBe(true);
    });

    it('should mark kmPerformed as valid if greater than or equal to 1', () => {
      // Arrange
      component.maintenanceForm.controls.kmPerformed.setValue(1);

      // Act
      component.maintenanceForm.controls.kmPerformed.updateValueAndValidity();

      // Assert
      expect(component.maintenanceForm.controls.kmPerformed.valid).toBe(true);
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

    it('should call updateMaintenance and show success message on edit', () => {
      // Arrange
      component.maintenanceFromState = {
        id: 99,
        date: '2025-10-01',
        description: 'desc',
        kmPerformed: 2001,
        serviceSupplierId: 2,
      };
      component.maintenanceForm.controls.date.setValue('2025-10-01');
      component.maintenanceForm.controls.kmPerformed.setValue(2001);
      component.maintenanceForm.controls.supplier.setValue({
        id: 2,
        businessName: 'Proveedor',
      });
      vehicleServiceMock.updateMaintenance = jest.fn().mockReturnValue(of({}));
      // Act
      component.onSave();
      // Assert
      expect(vehicleServiceMock.updateMaintenance).toHaveBeenCalledWith(99, {
        date: '2025-10-01',
        kmPerformed: 2001,
        maintenancePlanItemId: component.maintenancePlanItemId,
        serviceSupplierId: 2,
      });
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Mantenimiento modificado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
      expect(locationMock.back).toHaveBeenCalled();
    });

    it('should show error message if updateMaintenance fails', () => {
      // Arrange
      component.maintenanceFromState = {
        id: 99,
        date: '2025-10-01',
        description: 'desc',
        kmPerformed: 2001,
        serviceSupplierId: 2,
      };
      component.maintenanceForm.controls.date.setValue('2025-10-01');
      component.maintenanceForm.controls.kmPerformed.setValue(2001);
      component.maintenanceForm.controls.supplier.setValue({
        id: 2,
        businessName: 'Proveedor',
      });
      vehicleServiceMock.updateMaintenance = jest
        .fn()
        .mockReturnValue(throwError(() => new Error('fail')));
      // Act
      component.onSave();
      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Ocurrió un error al editar el mantenimiento',
        'Cerrar',
        { duration: 3000 },
      );
    });
  });
});
