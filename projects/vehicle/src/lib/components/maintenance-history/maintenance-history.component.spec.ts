import { downloadFileFromResponse, VehicleService } from '@Common';

import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MaintenanceHistoryComponent } from './maintenance-history.component';

jest.mock('@Common', () => {
  const actual = jest.requireActual('@Common');
  return {
    ...actual,
    downloadFileFromResponse: jest.fn(),
  };
});

describe('MaintenanceHistoryComponent', () => {
  let component: MaintenanceHistoryComponent;
  let fixture: ComponentFixture<MaintenanceHistoryComponent>;

  const mockVehicleService = {
    getVehicleById: jest.fn(() => of(undefined)), // <-- Devuelve un observable por defecto
    downloadMaintenanceHistory: jest.fn(),
  };

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
        {
          provide: Router,
          useValue: { navigate: jest.fn() },
        },
        {
          provide: VehicleService,
          useValue: mockVehicleService,
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
    const spy = jest.spyOn(component, 'onCreateMaintenancePlan');
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

  describe('handleDownloadClick', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call vehicleService.downloadMaintenanceHistory with correct vehicleId and trigger file download', () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      const mockHttpResponse = new HttpResponse({
        body: new Blob(['test'], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        status: 200,
        statusText: 'OK',
      });
      jest
        .spyOn(vehicleService, 'downloadMaintenanceHistory')
        .mockReturnValue(of(mockHttpResponse));

      // Act
      component.handleDownloadClick();

      // Assert
      expect(vehicleService.downloadMaintenanceHistory).toHaveBeenCalledWith(
        123,
      );
      expect(downloadFileFromResponse).toHaveBeenCalledWith(
        mockHttpResponse,
        'historial_mantenimiento.xlsx',
      );
    });

    it('should handle errors from vehicleService.downloadMaintenanceHistory', () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      jest
        .spyOn(vehicleService, 'downloadMaintenanceHistory')
        .mockReturnValueOnce(throwError(() => new Error('Download error')));
      component.vehicleId = 123;

      // Act
      component.handleDownloadClick();

      // Assert
      expect(downloadFileFromResponse).not.toHaveBeenCalled();
    });
  });

  describe('onCreateMaintenancePlan', () => {
    it('should navigate to crear-plan-mantenimiento with relative route', () => {
      // Arrange
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate');
      // Act
      component.onCreateMaintenancePlan();
      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['crear-plan-mantenimiento'], {
        relativeTo: expect.any(Object),
      });
    });
  });

  describe('onCreateRepairDrawer', () => {
    it('should navigate to crear-reparacion with relative route', () => {
      // Arrange
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate');
      // Act
      component.onCreateRepairDrawer();
      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['crear-reparacion'], {
        relativeTo: expect.any(Object),
      });
    });
  });
});
