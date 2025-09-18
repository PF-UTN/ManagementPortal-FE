import { LateralDrawerService } from '@Common-UI';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { CreateUpdateMaintenanceItemLateralDrawerComponent } from './create-update-maintenance-item-lateral-drawer.component';
import { VehicleService } from '../../services/vehicle.service';

describe('CreateUpdateMaintenanceItemLateralDrawerComponent', () => {
  let fixture: ComponentFixture<CreateUpdateMaintenanceItemLateralDrawerComponent>;
  let component: CreateUpdateMaintenanceItemLateralDrawerComponent;

  let drawerService: LateralDrawerService;
  let vehicleService: VehicleService;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CreateUpdateMaintenanceItemLateralDrawerComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        { provide: VehicleService, useValue: mockDeep<VehicleService>() },
        { provide: MatSnackBar, useValue: mockDeep<MatSnackBar>() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      CreateUpdateMaintenanceItemLateralDrawerComponent,
    );
    component = fixture.componentInstance;

    drawerService = TestBed.inject(LateralDrawerService);
    vehicleService = TestBed.inject(VehicleService);
    snackBar = TestBed.inject(MatSnackBar);
  });

  it('should create the component', () => {
    // Arrange & Act
    fixture.detectChanges();

    // Assert
    expect(component).toBeTruthy();
  });

  describe('form initialization', () => {
    it('should initialize with empty description if no maintenanceItem is set', () => {
      // Arrange
      component.maintenanceItem = undefined;

      // Act
      component.ngOnInit();

      // Assert
      expect(component.form.controls.description.value).toBeNull();
      expect(component.isUpdating()).toBe(false);
    });

    it('should initialize with description if maintenanceItem is provided', () => {
      // Arrange
      component.maintenanceItem = { id: 1, description: 'Oil change' };

      // Act
      component.ngOnInit();

      // Assert
      expect(component.form.controls.description.value).toBe('Oil change');
      expect(component.isUpdating()).toBe(true);
    });
  });

  describe('closeDrawer', () => {
    it('should call drawerService.close()', () => {
      // Arrange
      // Act
      component.closeDrawer();

      // Assert
      expect(drawerService.close).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.form.controls.description.setValue('Brake check');
    });

    it('should call postCreateMaintenanceItemAsync when creating', () => {
      // Arrange
      component.maintenanceItem = undefined;
      (
        vehicleService.postCreateMaintenanceItemAsync as jest.Mock
      ).mockReturnValue(of({}));

      // Act
      component.onSubmit();

      // Assert
      expect(
        vehicleService.postCreateMaintenanceItemAsync,
      ).toHaveBeenCalledWith({
        description: 'Brake check',
      });
      expect(snackBar.open).toHaveBeenCalledWith(
        'Ítem de Mantenimiento creado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
      expect(drawerService.close).toHaveBeenCalled();
    });

    it('should call putUpdateMaintenanceItemAsync when updating', () => {
      // Arrange
      component.maintenanceItem = { id: 5, description: 'Old desc' };
      component.isUpdating.set(true);
      (
        vehicleService.putUpdateMaintenanceItemAsync as jest.Mock
      ).mockReturnValue(of({}));

      // Act
      component.onSubmit();

      // Assert
      expect(vehicleService.putUpdateMaintenanceItemAsync).toHaveBeenCalledWith(
        5,
        {
          description: 'Brake check',
        },
      );
      expect(snackBar.open).toHaveBeenCalledWith(
        'Ítem de Mantenimiento modificado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
      expect(drawerService.close).toHaveBeenCalled();
    });
  });

  describe('drawer config effect', () => {
    it('should update drawer config with correct title and buttons', () => {
      // Arrange
      component.ngOnInit();
      component.form.controls.description.setValue('Valid desc');

      // Act
      fixture.detectChanges();

      // Assert
      expect(drawerService.updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Crear Ítem de Mantenimiento',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({
              text: 'Crear',
              disabled: false,
            }),
          }),
        }),
      );
    });
  });
});
