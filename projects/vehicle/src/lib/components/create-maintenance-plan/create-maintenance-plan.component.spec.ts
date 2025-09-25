import { LateralDrawerService } from '@Common-UI';

import { Location } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { CreateMaintenancePlanComponent } from './create-maintenance-plan.component';
import {
  MaintenanceItemSearchResult,
  SearchMaintenanceItemResponse,
} from '../../models/maintenance-item-response.model';
import { VehicleService } from '../../services/vehicle.service';

describe('CreateMaintenancePlanComponent', () => {
  let component: CreateMaintenancePlanComponent;
  let fixture: ComponentFixture<CreateMaintenancePlanComponent>;
  let vehicleService: jest.Mocked<VehicleService>;
  let snackBar: { open: jest.Mock };
  let location: { back: jest.Mock };
  let lateralDrawerService: LateralDrawerService;

  beforeEach(async () => {
    vehicleService = {
      postSearchMaintenanceItem: jest
        .fn()
        .mockReturnValue(of({ results: [], total: 0 })),
      createMaintenancePlanItem: jest.fn(),
    } as unknown as jest.Mocked<VehicleService>;

    snackBar = { open: jest.fn() };
    location = { back: jest.fn() };

    Object.defineProperty(history, 'state', {
      value: {},
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [CreateMaintenancePlanComponent, NoopAnimationsModule],
      providers: [
        { provide: VehicleService, useValue: vehicleService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: Location, useValue: location },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'vehicleId' ? '123' : null),
              },
            },
          },
        },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMaintenancePlanComponent);
    lateralDrawerService = TestBed.inject(LateralDrawerService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set vehicleId from route', () => {
      // Assert
      expect(component.vehicleId).toBe(123);
    });

    it('should initialize the form with correct controls', () => {
      // Assert
      expect(component.maintenanceForm.contains('maintenanceItem')).toBe(true);
      expect(component.maintenanceForm.contains('maintenanceItemId')).toBe(
        true,
      );
      expect(component.maintenanceForm.contains('kmInterval')).toBe(true);
      expect(component.maintenanceForm.contains('timeInterval')).toBe(true);
    });

    it('should set up filteredMaintenanceItems$ observable', fakeAsync(() => {
      // Arrange
      const mockResults: MaintenanceItemSearchResult[] = [
        { id: 1, description: 'Test' },
      ];
      const mockResponse: SearchMaintenanceItemResponse = {
        total: 1,
        results: mockResults,
      };
      vehicleService.postSearchMaintenanceItem.mockReturnValue(
        of(mockResponse),
      );
      component.maintenanceForm.controls.maintenanceItem.setValue({
        id: 1,
        description: 'Test',
      });

      // Act
      let items: MaintenanceItemSearchResult[] = [];
      const sub = component.filteredMaintenanceItems$.subscribe((res) => {
        items = res;
      });
      tick(200);

      // Assert
      expect(items.some((i) => i.description === 'Test')).toBe(true);
      expect(
        items.some((i) => i.description === '+ Crear item de mantenimiento'),
      ).toBe(true);
      sub.unsubscribe();
    }));
  });

  describe('displayMaintenanceItem', () => {
    it('should return description if item is defined', () => {
      // Arrange
      const item: MaintenanceItemSearchResult = { id: 1, description: 'Desc' };

      // Act
      const result = component.displayMaintenanceItem(item);

      // Assert
      expect(result).toBe('Desc');
    });

    it('should return empty string if item is null or undefined', () => {
      // Act & Assert
      expect(
        component.displayMaintenanceItem(
          null as unknown as MaintenanceItemSearchResult,
        ),
      ).toBe('');
      expect(
        component.displayMaintenanceItem(
          undefined as unknown as MaintenanceItemSearchResult,
        ),
      ).toBe('');
    });
  });

  describe('onMaintenanceItemSelected', () => {
    it('should reset maintenanceItem if id is -1', () => {
      // Arrange
      const event = {
        option: {
          value: {
            id: -1,
            description: 'Create',
          } as MaintenanceItemSearchResult,
        },
      };
      const resetSpy = jest.spyOn(
        component.maintenanceForm.controls.maintenanceItem,
        'reset',
      );
      jest.spyOn(lateralDrawerService, 'open').mockReturnValue(of(void 0));

      // Act
      component.onMaintenanceItemSelected(
        event as unknown as import('@angular/material/autocomplete').MatAutocompleteSelectedEvent,
      );

      // Assert
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should patch maintenanceItemId if id is not -1', () => {
      // Arrange
      const event = {
        option: {
          value: { id: 5, description: 'Real' } as MaintenanceItemSearchResult,
        },
      };

      // Act
      component.onMaintenanceItemSelected(
        event as unknown as import('@angular/material/autocomplete').MatAutocompleteSelectedEvent,
      );

      // Assert
      expect(component.maintenanceForm.controls.maintenanceItemId.value).toBe(
        5,
      );
    });
  });

  describe('maintenanceItemObjectValidator', () => {
    it('should return required error if value is falsy', () => {
      // Arrange
      const validator = component.maintenanceItemObjectValidator();

      // Act
      const result = validator(new FormControl(null));

      // Assert
      expect(result).toEqual({ required: true });
    });

    it('should return null if value is object with id', () => {
      // Arrange
      const validator = component.maintenanceItemObjectValidator();

      // Act
      const result = validator(new FormControl({ id: 1, description: 'desc' }));

      // Assert
      expect(result).toBeNull();
    });

    it('should return invalidMaintenanceItem if value is not object with id', () => {
      // Arrange
      const validator = component.maintenanceItemObjectValidator();

      // Act
      const result = validator(new FormControl('string'));

      // Assert
      expect(result).toEqual({ invalidMaintenanceItem: true });
    });
  });

  describe('intervalValidator', () => {
    it('should return error if both kmInterval and timeInterval are null or empty', () => {
      // Arrange
      const group = new FormGroup({
        kmInterval: new FormControl(null),
        timeInterval: new FormControl(null),
      });

      // Act
      const result = component.intervalValidator(group);

      // Assert
      expect(result).toEqual({ invalidInterval: true });
    });

    it('should return null if at least one interval is set', () => {
      // Arrange
      const group1 = new FormGroup({
        kmInterval: new FormControl(1000),
        timeInterval: new FormControl(null),
      });
      const group2 = new FormGroup({
        kmInterval: new FormControl(null),
        timeInterval: new FormControl(12),
      });

      // Act & Assert
      expect(component.intervalValidator(group1)).toBeNull();
      expect(component.intervalValidator(group2)).toBeNull();
    });
  });

  describe('onSave', () => {
    it('should mark all as touched and not call service if form is invalid', () => {
      // Arrange
      component.maintenanceForm.controls.maintenanceItem.setValue(null);

      // Act
      component.onSave();

      // Assert
      expect(component.maintenanceForm.markAllAsTouched).toBeDefined();
      expect(vehicleService.createMaintenancePlanItem).not.toHaveBeenCalled();
    });

    it('should call service, show snackbar and go back on success', () => {
      // Arrange
      component.maintenanceForm.setValue({
        maintenanceItem: { id: 1, description: 'desc' },
        maintenanceItemId: 1,
        kmInterval: 1000,
        timeInterval: null,
      });
      vehicleService.createMaintenancePlanItem.mockReturnValue(of({}));

      // Act
      component.onSave();

      // Assert
      expect(component.isLoading).toBe(false);
      expect(vehicleService.createMaintenancePlanItem).toHaveBeenCalledWith({
        vehicleId: 123,
        maintenanceItemId: 1,
        kmInterval: 1000,
        timeInterval: null,
      });
      expect(snackBar.open).toHaveBeenCalledWith(
        'Item de mantenimiento creado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
      expect(location.back).toHaveBeenCalled();
    });

    it('should show error snackbar on service error', () => {
      // Arrange
      component.maintenanceForm.setValue({
        maintenanceItem: { id: 1, description: 'desc' },
        maintenanceItemId: 1,
        kmInterval: 1000,
        timeInterval: null,
      });
      vehicleService.createMaintenancePlanItem.mockReturnValue(
        throwError(() => new Error('error')),
      );

      // Act
      component.onSave();

      // Assert
      expect(component.isLoading).toBe(false);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Ocurrió un error al crear el item',
        'Cerrar',
        { duration: 3000 },
      );
    });
  });

  describe('handleCreateOrUpdateMaintenanceItemLateralDrawer', () => {
    it('should reset maintenanceItem control after drawer closes', () => {
      // Arrange
      const item: MaintenanceItemSearchResult = {
        id: 3,
        description: 'Drawer item',
      };
      jest.spyOn(lateralDrawerService, 'open').mockReturnValue(of(void 0));
      const resetSpy = jest.spyOn(
        component.maintenanceForm.controls.maintenanceItem,
        'reset',
      );

      // Act
      (component as CreateMaintenancePlanComponent)[
        'handleCreateOrUpdateMaintenanceItemLateralDrawer'
      ](item);

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalled();
      resetSpy.mockRestore();
    });
  });

  describe('maintenanceItem valueChanges', () => {
    it('should set maintenanceItemId when maintenanceItem is an object with id', () => {
      // Arrange
      const item: MaintenanceItemSearchResult = {
        id: 10,
        description: 'Sync item',
      };

      // Act
      component.maintenanceForm.controls.maintenanceItem.setValue(item);

      // Assert
      expect(component.maintenanceForm.controls.maintenanceItemId.value).toBe(
        10,
      );
    });

    it('should set maintenanceItemId to null when maintenanceItem is not an object with id', () => {
      // Arrange
      // Act
      component.maintenanceForm.controls.maintenanceItem.setValue(
        'string' as unknown as MaintenanceItemSearchResult,
      );

      // Assert
      expect(
        component.maintenanceForm.controls.maintenanceItemId.value,
      ).toBeNull();
    });
  });
});
