import { VehicleService } from '@Common';
import { ModalComponent } from '@Common-UI';

import { DecimalPipe } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, firstValueFrom } from 'rxjs';

import { MaintenancePlanListComponent } from './maintenance-plan-list.component';
import { MaintenancePlanListItem } from '../../../../../common/src/models/vehicle/maintenance-plan.model';

@Component({
  template: `<mp-maintenance-plan-list
    [vehicleId]="vehicleId"
  ></mp-maintenance-plan-list>`,
  standalone: true,
  imports: [MaintenancePlanListComponent],
})
class HostComponent {
  vehicleId = 1;
}

describe('MaintenancePlanListComponent', () => {
  let hostFixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;
  let component: MaintenancePlanListComponent;

  beforeEach(async () => {
    const vehicleServiceMock = {
      postSearchMaintenancePlanItemVehicle: jest
        .fn()
        .mockReturnValue(of({ results: [], total: 0 })),
      postSearchMaintenanceVehicle: jest
        .fn()
        .mockReturnValue(of({ results: [], total: 0 })),
      deleteMaintenancePlanItem: jest.fn().mockReturnValue(of(void 0)),
      getVehicleById: jest.fn().mockReturnValue(
        of({
          id: 1,
          licensePlate: 'ABC123',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2020,
          kmTraveled: 0,
        }),
      ),
    } as unknown as jest.Mocked<VehicleService>;

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        DecimalPipe,
        provideHttpClientTesting(),
        { provide: VehicleService, useValue: vehicleServiceMock },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    const childDebugElement = hostFixture.debugElement.children[0];
    component = childDebugElement.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    // Arrange & Act done in beforeEach
    // Assert
    expect(component).toBeTruthy();
  });

  it('should have default pageIndex and pageSize', () => {
    // Arrange & Act done in beforeEach
    // Assert
    expect(component.pageIndex).toBe(0);
    expect(component.pageSize).toBe(10);
  });

  it('should update pageIndex and pageSize on handlePageChange', () => {
    // Arrange
    const event = { pageIndex: 2, pageSize: 25 };
    // Act
    component.handlePageChange(event);
    // Assert
    expect(component.pageIndex).toBe(2);
    expect(component.pageSize).toBe(25);
  });

  it('should format kmInterval using decimalPipe', () => {
    // Arrange
    const item: MaintenancePlanListItem = {
      id: 1,
      description: 'Cambio de aceite',
      kmInterval: 15000,
      timeInterval: 12,
    };
    const kmColumn = component.columns.find(
      (col) => col.columnDef === 'kmInterval',
    );
    // Act
    const result =
      kmColumn && kmColumn.value ? kmColumn.value(item) : undefined;
    // Assert
    expect(result).toBe('15,000 km');
  });

  it('should return timeInterval as string with "Meses"', () => {
    // Arrange
    const item: MaintenancePlanListItem = {
      id: 1,
      description: 'Cambio de filtro',
      kmInterval: 10000,
      timeInterval: 6,
    };
    const timeColumn = component.columns.find(
      (col) => col.columnDef === 'timeInterval',
    );
    // Act
    const result =
      timeColumn && timeColumn.value ? timeColumn.value(item) : undefined;
    // Assert
    expect(result).toBe('6 Meses');
  });

  it('should call action handlers for actions column', () => {
    // Arrange
    const item: MaintenancePlanListItem = {
      id: 1,
      description: 'Cambio de correa',
      kmInterval: 50000,
      timeInterval: 24,
    };
    const actionsColumn = component.columns.find(
      (col) => col.columnDef === 'actions',
    );
    const routerSpy = jest.spyOn(component['router'], 'navigate');
    // Act
    actionsColumn?.actions?.[0].action(item);
    actionsColumn?.actions?.[1].action(item);
    actionsColumn?.actions?.[2].action(item);
    // Assert
    expect(routerSpy).toHaveBeenCalledWith(['realizar', item.id], {
      relativeTo: component['route'],
    });
    expect(routerSpy).toHaveBeenCalledWith(['crear-plan-mantenimiento'], {
      relativeTo: component['route'],
      state: { plan: item },
    });
    const deleteSpy = jest.spyOn(component, 'deleteMaintenancePlanItem');
    actionsColumn?.actions?.[2].action(item);
    expect(deleteSpy).toHaveBeenCalledWith(item);
  });

  it('should show "-" for kmInterval when null', () => {
    // Arrange
    const item: MaintenancePlanListItem = {
      id: 1,
      description: 'Sin km',
      kmInterval: null,
      timeInterval: 12,
    };
    const kmColumn = component.columns.find(
      (col) => col.columnDef === 'kmInterval',
    );
    // Act
    const result =
      kmColumn && kmColumn.value ? kmColumn.value(item) : undefined;
    // Assert
    expect(result).toBe('-');
  });

  it('should show "-" for timeInterval when null', () => {
    // Arrange
    const item: MaintenancePlanListItem = {
      id: 1,
      description: 'Sin meses',
      kmInterval: 10000,
      timeInterval: 0,
    };
    const timeColumn = component.columns.find(
      (col) => col.columnDef === 'timeInterval',
    );
    // Act
    const result =
      timeColumn && timeColumn.value ? timeColumn.value(item) : undefined;
    // Assert
    expect(result).toBe('-');
  });

  describe('ngOnInit', () => {
    it('should fetch data and update dataSource$, itemsNumber and isLoading on success', async () => {
      // Arrange
      const mockResponse = {
        results: [
          {
            id: 1,
            description: 'Cambio de aceite',
            kmInterval: 10000,
            timeInterval: 6,
          },
          {
            id: 2,
            description: 'Cambio de filtro',
            kmInterval: 15000,
            timeInterval: 12,
          },
        ],
        total: 2,
      };

      const mockMaintenances = {
        results: [
          {
            id: 101,
            planId: 1,
            date: '2023-01-01T00:00:00.000Z',
            description: 'Cambio de aceite',
            kmPerformed: 50000,
          },
          {
            id: 102,
            planId: 2,
            date: '2023-02-01T00:00:00.000Z',
            description: 'Cambio de filtro',
            kmPerformed: 60000,
          },
        ],
        total: 2,
      };

      const vehicleService = TestBed.inject(VehicleService);
      jest
        .spyOn(vehicleService, 'postSearchMaintenancePlanItemVehicle')
        .mockReturnValue(of(mockResponse));
      jest
        .spyOn(vehicleService, 'postSearchMaintenanceVehicle')
        .mockReturnValue(of(mockMaintenances));

      hostComponent.vehicleId = 1;
      // Act
      component.ngOnInit();
      // Assert
      const data = await firstValueFrom(component.dataSource$);
      expect(data).toEqual([
        {
          ...mockResponse.results[0],
          lastMaintenanceDate: '2023-01-01T00:00:00.000Z',
          lastMaintenanceKm: 50000,
          currentKm: 0,
        },
        {
          ...mockResponse.results[1],
          lastMaintenanceDate: '2023-02-01T00:00:00.000Z',
          lastMaintenanceKm: 60000,
          currentKm: 0,
        },
      ]);
      expect(component.itemsNumber).toBe(2);
      expect(component.isLoading).toBe(false);
    });
    it('should clear dataSource$, itemsNumber and isLoading on error', async () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      jest
        .spyOn(vehicleService, 'postSearchMaintenancePlanItemVehicle')
        .mockReturnValue(throwError(() => new Error('fail')));
      component.itemsNumber = 5;
      component.isLoading = true;
      hostComponent.vehicleId = 1;
      // Act
      component.ngOnInit();
      // Assert
      const data = await firstValueFrom(component.dataSource$);
      expect(data).toEqual([]);
      expect(component.itemsNumber).toBe(0);
      expect(component.isLoading).toBe(false);
    });

    it('should set lastMaintenanceKm and lastMaintenanceDate to null if there are no maintenances for a plan', async () => {
      // Arrange
      const mockResponse = {
        results: [
          {
            id: 1,
            description: 'Cambio de aceite',
            kmInterval: 10000,
            timeInterval: 6,
          },
        ],
        total: 1,
      };

      const mockMaintenances = {
        results: [],
        total: 0,
      };

      const vehicleService = TestBed.inject(VehicleService);
      jest
        .spyOn(vehicleService, 'postSearchMaintenancePlanItemVehicle')
        .mockReturnValue(of(mockResponse));
      jest
        .spyOn(vehicleService, 'postSearchMaintenanceVehicle')
        .mockReturnValue(of(mockMaintenances));

      hostComponent.vehicleId = 1;
      // Act
      component.ngOnInit();
      // Assert
      const data = await firstValueFrom(component.dataSource$);
      expect(data).toEqual([
        {
          ...mockResponse.results[0],
          lastMaintenanceDate: null,
          lastMaintenanceKm: null,
          currentKm: 0,
        },
      ]);
    });

    it('should clear dataSource$, itemsNumber and isLoading if getVehicleById fails', async () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      jest
        .spyOn(vehicleService, 'getVehicleById')
        .mockReturnValue(throwError(() => new Error('fail')));
      component.itemsNumber = 5;
      component.isLoading = true;
      hostComponent.vehicleId = 1;
      // Act
      component.ngOnInit();
      // Assert
      const data = await firstValueFrom(component.dataSource$);
      expect(data).toEqual([]);
      expect(component.itemsNumber).toBe(0);
      expect(component.isLoading).toBe(false);
    });

    it('should clear dataSource$, itemsNumber and isLoading if postSearchMaintenancePlanItemVehicle fails', async () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      jest.fn().mockReturnValue(
        of({
          id: 1,
          licensePlate: 'ABC123',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2020,
          kmTraveled: 0,
          enabled: true,
          admissionDate: '2023-01-01T00:00:00.000Z',
        }),
      );
      jest
        .spyOn(vehicleService, 'postSearchMaintenancePlanItemVehicle')
        .mockReturnValue(throwError(() => new Error('fail')));
      component.itemsNumber = 5;
      component.isLoading = true;
      hostComponent.vehicleId = 1;
      // Act
      component.ngOnInit();
      // Assert
      const data = await firstValueFrom(component.dataSource$);
      expect(data).toEqual([]);
      expect(component.itemsNumber).toBe(0);
      expect(component.isLoading).toBe(false);
    });

    it('should clear dataSource$, itemsNumber and isLoading if postSearchMaintenanceVehicle fails', async () => {
      // Arrange
      const vehicleService = TestBed.inject(VehicleService);
      jest.fn().mockReturnValue(
        of({
          id: 1,
          licensePlate: 'ABC123',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2020,
          kmTraveled: 0,
          enabled: true,
          admissionDate: '2023-01-01T00:00:00.000Z',
        }),
      );
      jest
        .spyOn(vehicleService, 'postSearchMaintenancePlanItemVehicle')
        .mockReturnValue(of({ results: [], total: 0 }));
      jest
        .spyOn(vehicleService, 'postSearchMaintenanceVehicle')
        .mockReturnValue(throwError(() => new Error('fail')));
      component.itemsNumber = 5;
      component.isLoading = true;
      hostComponent.vehicleId = 1;
      // Act
      component.ngOnInit();
      // Assert
      const data = await firstValueFrom(component.dataSource$);
      expect(data).toEqual([]);
      expect(component.itemsNumber).toBe(0);
      expect(component.isLoading).toBe(false);
    });
  });

  it('should navigate to realizar route with correct params when Realizar is clicked', () => {
    // Arrange
    const item: MaintenancePlanListItem = {
      id: 42,
      description: 'Cambio de aceite',
      kmInterval: 10000,
      timeInterval: 6,
    };
    const actionsColumn = component.columns.find(
      (col) => col.columnDef === 'actions',
    );
    const routerSpy = jest.spyOn(component['router'], 'navigate');
    // Act
    actionsColumn?.actions?.[0].action(item);
    // Assert
    expect(routerSpy).toHaveBeenCalledWith(['realizar', item.id], {
      relativeTo: component['route'],
    });
  });

  it('should calculate nextMaintenanceDate based on last maintenance and timeInterval', () => {
    // Arrange
    const plan: MaintenancePlanListItem = {
      id: 1,
      description: 'Cambio de aceite',
      kmInterval: 10000,
      timeInterval: 6,
    };
    const lastMaintenanceDate = '2023-01-01T00:00:00.000Z';
    const planWithExtras = { ...plan, lastMaintenanceDate };
    const column = component.columns.find(
      (col) => col.columnDef === 'nextMaintenanceDate',
    );

    // Act
    const result =
      column && column.value ? column.value(planWithExtras) : undefined;

    // Assert
    const expectedDate = new Date(lastMaintenanceDate);
    expectedDate.setMonth(expectedDate.getMonth() + plan.timeInterval!);
    expect(result).toBe(expectedDate.toLocaleDateString());
  });

  it('should calculate nextMaintenanceKm based on last maintenance and kmInterval', () => {
    // Arrange
    const plan: MaintenancePlanListItem = {
      id: 1,
      description: 'Cambio de aceite',
      kmInterval: 10000,
      timeInterval: 6,
    };
    const lastMaintenanceKm = 50000;
    const planWithExtras = { ...plan, lastMaintenanceKm };
    const column = component.columns.find(
      (col) => col.columnDef === 'nextMaintenanceKm',
    );

    // Act
    const result =
      column && column.value ? column.value(planWithExtras) : undefined;

    // Assert
    expect(result).toBe('60,000 km');
  });

  it('should show "-" for nextMaintenanceDate if no last maintenance', () => {
    // Arrange
    const plan: MaintenancePlanListItem = {
      id: 1,
      description: 'Cambio de aceite',
      kmInterval: 10000,
      timeInterval: 6,
    };
    const planWithExtras = { ...plan, lastMaintenanceDate: undefined };
    const column = component.columns.find(
      (col) => col.columnDef === 'nextMaintenanceDate',
    );

    // Act
    const result =
      column && column.value ? column.value(planWithExtras) : undefined;

    // Assert
    expect(result).toBe('-');
  });

  it('should show "-" for nextMaintenanceKm if no last maintenance', () => {
    // Arrange
    const plan: MaintenancePlanListItem = {
      id: 1,
      description: 'Cambio de aceite',
      kmInterval: 10000,
      timeInterval: 6,
    };
    const planWithExtras = { ...plan, lastMaintenanceKm: undefined };
    const column = component.columns.find(
      (col) => col.columnDef === 'nextMaintenanceKm',
    );

    // Act
    const result =
      column && column.value ? column.value(planWithExtras) : undefined;

    // Assert
    expect(result).toBe('-');
  });

  describe('columns', () => {
    it('should have the correct columns defined', () => {
      // Arrange & Act
      const columnDefs = component.columns.map((col) => col.columnDef);
      // Assert
      expect(columnDefs).toEqual([
        'description',
        'nextMaintenanceDate',
        'nextMaintenanceKm',
        'kmInterval',
        'timeInterval',
        'actions',
      ]);
    });

    it('should show "-" for nextMaintenanceKm if kmInterval is null', () => {
      // Arrange
      const plan: MaintenancePlanListItem = {
        id: 1,
        description: 'Cambio de aceite',
        kmInterval: null,
        timeInterval: 6,
      };
      const planWithExtras = {
        ...plan,
        lastMaintenanceKm: 50000,
        currentKm: 100000,
      };
      const column = component.columns.find(
        (col) => col.columnDef === 'nextMaintenanceKm',
      );

      // Act
      const result =
        column && column.value ? column.value(planWithExtras) : undefined;

      // Assert
      expect(result).toBe('-');
    });

    it('should calculate nextMaintenanceKm based on currentKm and kmInterval if no lastMaintenanceKm', () => {
      // Arrange
      const plan: MaintenancePlanListItem = {
        id: 1,
        description: 'Cambio de filtro',
        kmInterval: 20000,
        timeInterval: 12,
      };
      const planWithExtras = { ...plan, currentKm: 80000 };
      const column = component.columns.find(
        (col) => col.columnDef === 'nextMaintenanceKm',
      );

      // Act
      const result =
        column && column.value ? column.value(planWithExtras) : undefined;

      // Assert
      expect(result).toBe('100,000 km');
    });
  });

  describe('formatTimeInterval', () => {
    it('should return "-" if timeInterval is null', () => {
      // Arrange & Act
      const result = component.formatTimeInterval(null);
      // Assert
      expect(result).toBe('-');
    });

    it('should return "-" if timeInterval is 0', () => {
      // Arrange & Act
      const result = component.formatTimeInterval(0);
      // Assert
      expect(result).toBe('-');
    });

    it('should return "<n> Meses" if timeInterval is a positive number', () => {
      // Arrange & Act
      const result = component.formatTimeInterval(8);
      // Assert
      expect(result).toBe('8 Meses');
    });
  });

  describe('deleteMaintenancePlanItem', () => {
    it('should open the modal, call delete service, refresh list and show snackbar on confirm', () => {
      // Arrange
      const item: MaintenancePlanListItem = {
        id: 123,
        description: 'Test',
        kmInterval: 10000,
        timeInterval: 12,
      };
      const dialogRefMock = {
        afterClosed: () => of(true),
      };
      const dialog = TestBed.inject(MatDialog);
      const dialogSpy = jest
        .spyOn(dialog, 'open')
        .mockReturnValue(dialogRefMock as ReturnType<typeof dialog.open>);
      const vehicleService = TestBed.inject(VehicleService);
      const deleteSpy = jest
        .spyOn(vehicleService, 'deleteMaintenancePlanItem')
        .mockReturnValue(of(void 0));
      const ngOnInitSpy = jest.spyOn(component, 'ngOnInit');
      const snackBar = TestBed.inject(MatSnackBar);
      const snackBarSpy = jest.spyOn(snackBar, 'open');

      // Act
      component.deleteMaintenancePlanItem(item);

      // Assert
      expect(dialogSpy).toHaveBeenCalledWith(
        ModalComponent,
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Eliminar ítem',
            message: expect.stringContaining('¿Está seguro'),
          }),
        }),
      );
      expect(deleteSpy).toHaveBeenCalledWith(item.id);
      expect(ngOnInitSpy).toHaveBeenCalled();
      expect(snackBarSpy).toHaveBeenCalledWith(
        'Mantenimiento eliminado exitosamente',
        'Cerrar',
        { duration: 3000 },
      );
    });

    it('should NOT call delete service if user cancels', () => {
      // Arrange
      const item: MaintenancePlanListItem = {
        id: 123,
        description: 'Test',
        kmInterval: 10000,
        timeInterval: 12,
      };
      const dialogRefMock = {
        afterClosed: () => of(false),
      };
      const dialog = TestBed.inject(MatDialog);
      jest
        .spyOn(dialog, 'open')
        .mockReturnValue(dialogRefMock as ReturnType<typeof dialog.open>);

      const vehicleService = TestBed.inject(VehicleService);
      const deleteSpy = jest.spyOn(vehicleService, 'deleteMaintenancePlanItem');

      // Act
      component.deleteMaintenancePlanItem(item);

      // Assert
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should call deleteMaintenancePlanItem when Eliminar is clicked', () => {
      // Arrange
      const item: MaintenancePlanListItem = {
        id: 1,
        description: 'Cambio de correa',
        kmInterval: 50000,
        timeInterval: 24,
      };
      const actionsColumn = component.columns.find(
        (col) => col.columnDef === 'actions',
      );
      const deleteSpy = jest.spyOn(component, 'deleteMaintenancePlanItem');
      // Act
      actionsColumn?.actions?.[2].action(item);
      // Assert
      expect(deleteSpy).toHaveBeenCalledWith(item);
    });

    it('should show translated error snackbar if item is used in a maintenance', () => {
      // Arrange
      const item: MaintenancePlanListItem = {
        id: 123,
        description: 'Test',
        kmInterval: 10000,
        timeInterval: 12,
      };
      const dialogRefMock = {
        afterClosed: () => of(true),
      };
      const dialog = TestBed.inject(MatDialog);
      jest
        .spyOn(dialog, 'open')
        .mockReturnValue(dialogRefMock as ReturnType<typeof dialog.open>);

      const errorResponse = {
        error: {
          message:
            'Maintenance plan item with id 123 is being used in a Maintenance and cannot be deleted.',
        },
      };
      const vehicleService = TestBed.inject(VehicleService);
      jest
        .spyOn(vehicleService, 'deleteMaintenancePlanItem')
        .mockReturnValue(throwError(() => errorResponse));

      const snackBar = TestBed.inject(MatSnackBar);
      const snackBarSpy = jest.spyOn(snackBar, 'open');

      // Act
      component.deleteMaintenancePlanItem(item);

      // Assert
      expect(snackBarSpy).toHaveBeenCalledWith(
        'No se puede eliminar el ítem porque ya fue utilizado en un mantenimiento.',
        'Cerrar',
        { duration: 4000 },
      );
    });
  });
});
