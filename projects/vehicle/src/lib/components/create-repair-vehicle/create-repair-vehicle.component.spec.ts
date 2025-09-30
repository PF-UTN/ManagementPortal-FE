import { LateralDrawerService } from '@Common-UI';

import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormBuilder,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CreateRepairVehicleComponent } from './create-repair-vehicle.component';
import { SupplierSearchResult } from '../../models/supplier-search-response-model';
import { VehicleService } from '../../services/vehicle.service';

describe('CreateRepairVehicleComponent', () => {
  let component: CreateRepairVehicleComponent;
  let fixture: ComponentFixture<CreateRepairVehicleComponent>;
  let vehicleServiceMock: jest.Mocked<VehicleService>;
  let snackBarMock: jest.Mocked<MatSnackBar>;
  let locationMock: jest.Mocked<Location>;
  let lateralDrawerServiceMock: jest.Mocked<LateralDrawerService>;

  beforeEach(async () => {
    vehicleServiceMock = {
      searchServiceSuppliers: jest.fn(),
      createRepairAsync: jest.fn(),
    } as unknown as jest.Mocked<VehicleService>;

    snackBarMock = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    locationMock = {
      back: jest.fn(),
    } as unknown as jest.Mocked<Location>;

    lateralDrawerServiceMock = {
      open: jest.fn().mockReturnValue(of(null)),
      close: jest.fn(),
    } as unknown as jest.Mocked<LateralDrawerService>;

    await TestBed.configureTestingModule({
      imports: [
        CreateRepairVehicleComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        FormBuilder,
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

    fixture = TestBed.createComponent(CreateRepairVehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the component and initialize the form', () => {
      // Arrange & Act
      // Assert
      expect(component).toBeTruthy();
      expect(component.repairForm).toBeDefined();
      expect(component.vehicleId).toBe(1);
    });
  });

  describe('Supplier Filtering', () => {
    it('should filter suppliers and include the "Gestionar proveedores" option', (done) => {
      // Arrange
      const suppliers: SupplierSearchResult[] = [
        { id: 1, businessName: 'Proveedor 1' },
        { id: 2, businessName: 'Proveedor 2' },
      ];
      vehicleServiceMock.searchServiceSuppliers.mockReturnValue(
        of({ results: suppliers, total: suppliers.length }),
      );
      component.repairForm.controls.supplier.setValue({
        id: 0,
        businessName: 'Prov',
      });

      // Act
      component.filteredSuppliers$.subscribe((result) => {
        // Assert
        expect(result).toEqual([
          ...suppliers,
          component.CREATE_SUPPLIER_OPTION,
        ]);
        done();
      });
    });
  });

  describe('Supplier Display', () => {
    it('should display supplier business name with displaySupplier', () => {
      // Arrange
      const supplier: SupplierSearchResult = {
        id: 1,
        businessName: 'Proveedor X',
      };
      // Act
      const result = component.displaySupplier(supplier);
      // Assert
      expect(result).toBe('Proveedor X');
    });

    it('should return empty string in displaySupplier if supplier is undefined', () => {
      // Arrange & Act
      const result = component.displaySupplier(
        undefined as unknown as SupplierSearchResult,
      );
      // Assert
      expect(result).toBe('');
    });
  });

  describe('Supplier Selection', () => {
    it('should select a supplier and patch the form', () => {
      // Arrange
      const supplier: SupplierSearchResult = {
        id: 2,
        businessName: 'Proveedor Y',
      };
      const event = {
        option: { value: supplier, viewValue: supplier.businessName },
      };
      // Act
      component.onSupplierSelected(event as MatAutocompleteSelectedEvent);
      // Assert
      expect(component.repairForm.controls.supplier.value).toEqual(supplier);
    });

    it('should open lateral drawer and reset supplier when "Gestionar proveedores" is selected', () => {
      // Arrange
      const supplier: SupplierSearchResult = {
        id: -1,
        businessName: '+ Gestionar proveedores',
      };
      const event = {
        option: { value: supplier, viewValue: supplier.businessName },
      };
      const openSpy = jest.spyOn(component, 'onCreateSupplierClick');
      // Act
      component.onSupplierSelected(event as MatAutocompleteSelectedEvent);
      // Assert
      expect(openSpy).toHaveBeenCalled();
      expect(component.repairForm.controls.supplier.value).toBeNull();
    });

    it('should open lateral drawer and reset supplier when onCreateSupplierClick is called', () => {
      // Arrange
      // Act
      component.onCreateSupplierClick();
      // Assert
      expect(lateralDrawerServiceMock.open).toHaveBeenCalled();
      setTimeout(() => {
        expect(component.repairForm.controls.supplier.value).toBeNull();
      }, 0);
    });
  });

  describe('Supplier Validator', () => {
    it('should validate supplierObjectValidator correctly', () => {
      // Arrange
      const validator = component.supplierObjectValidator();
      // Act & Assert
      expect(validator({ value: null } as AbstractControl)).toEqual({
        required: true,
      });
      expect(validator({ value: { id: -1 } } as AbstractControl)).toEqual({
        invalidSupplier: true,
      });
      expect(validator({ value: { id: 5 } } as AbstractControl)).toBeNull();
    });
  });

  describe('Save Repair', () => {
    it('should mark form as touched and not call service if form is invalid on save', () => {
      // Arrange
      component.repairForm.controls.date.setValue(null);
      const markAllAsTouchedSpy = jest.spyOn(
        component.repairForm,
        'markAllAsTouched',
      );
      // Act
      component.onSave();
      // Assert
      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(vehicleServiceMock.createRepairAsync).not.toHaveBeenCalled();
    });

    it('should call createRepairAsync and handle success on save', () => {
      // Arrange
      component.repairForm.setValue({
        date: '2024-09-30',
        description: 'Cambio de aceite',
        kmPerformed: 12345,
        supplier: { id: 10, businessName: 'Proveedor Z' },
      });
      vehicleServiceMock.createRepairAsync.mockReturnValue(of(undefined));
      // Act
      component.onSave();
      // Assert
      expect(vehicleServiceMock.createRepairAsync).toHaveBeenCalledWith(1, {
        date: '2024-09-30',
        description: 'Cambio de aceite',
        kmPerformed: 12345,
        serviceSupplierId: 10,
      });
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Reparación guardada',
        'Cerrar',
        { duration: 2000 },
      );
      expect(locationMock.back).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });

    it('should call createRepairAsync and handle error on save', () => {
      // Arrange
      component.repairForm.setValue({
        date: '2024-09-30',
        description: 'Cambio de aceite',
        kmPerformed: 12345,
        supplier: { id: 10, businessName: 'Proveedor Z' },
      });
      vehicleServiceMock.createRepairAsync.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      // Act
      component.onSave();
      // Assert
      expect(vehicleServiceMock.createRepairAsync).toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Error al guardar la reparación',
        'Cerrar',
        { duration: 2000 },
      );
      expect(component.isLoading).toBe(false);
    });
  });
});
