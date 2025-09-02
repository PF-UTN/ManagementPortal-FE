import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MaintenanceHistoryComponent } from './maintenance-history.component';
import { VehicleService } from '../../services/vehicle.service';
describe('MaintenanceHistoryComponent', () => {
  let component: MaintenanceHistoryComponent;
  let fixture: ComponentFixture<MaintenanceHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaintenanceHistoryComponent,
        NoopAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenanceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set vehicleId from route params on init', () => {
    // Arrange & Act: hecho en beforeEach
    // Assert
    expect(component.vehicleId).toBe(123);
  });

  it('should have dropdown items with correct labels', () => {
    // Act
    const labels = component.dropdownItems.map((item) => item.label);
    // Assert
    expect(labels).toContain('Crear Ítem de Mantenimiento');
    expect(labels).toContain('Crear Reparación');
  });

  it('should call onCreateMaintenanceDrawer when dropdown action is triggered', () => {
    // Arrange
    const spy = jest.spyOn(component, 'onCreateMaintenanceDrawer');
    // Act
    component.dropdownItems[0].action();
    // Assert
    expect(spy).toHaveBeenCalled();
  });

  it('should call onCreateRepairDrawer when dropdown action is triggered', () => {
    // Arrange
    const spy = jest.spyOn(component, 'onCreateRepairDrawer');
    // Act
    component.dropdownItems[1].action();
    // Assert
    expect(spy).toHaveBeenCalled();
  });

  it('should call getVehicleById and set vehicle on success', () => {
    // Arrange
    const mockVehicle = {
      id: 123,
      brand: 'Toyota',
      model: 'Corolla',
      licensePlate: 'ABC123',
      enabled: true,
      kmTraveled: 50000,
      admissionDate: '2022-01-01',
    };
    const vehicleService = TestBed.inject(VehicleService);
    jest
      .spyOn(vehicleService, 'getVehicleById')
      .mockReturnValue(of(mockVehicle));

    // Act
    component.ngOnInit();

    // Assert
    expect(vehicleService.getVehicleById).toHaveBeenCalledWith(123);
    expect(component.vehicle).toEqual(mockVehicle);
  });

  it('should set vehicle to undefined on service error', () => {
    // Arrange
    const vehicleService = TestBed.inject(VehicleService);
    jest
      .spyOn(vehicleService, 'getVehicleById')
      .mockReturnValue(throwError(() => new Error('error')));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.vehicle).toBeUndefined();
  });
});
