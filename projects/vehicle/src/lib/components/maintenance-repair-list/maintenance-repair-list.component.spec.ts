import { VehicleService } from '@Vehicle';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { throwError, of, firstValueFrom } from 'rxjs';

import { MaintenanceRepairListComponent } from './maintenance-repair-list.component';
import { RepairItem } from '../../models/repair-item.model';

@Component({
  template: `<mp-maintenance-repair-list
    [vehicleId]="vehicleId"
  ></mp-maintenance-repair-list>`,
  standalone: true,
  imports: [MaintenanceRepairListComponent],
})
class HostComponent {
  vehicleId = 1;
}

describe('MaintenanceRepairListComponent', () => {
  let hostFixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;
  let component: MaintenanceRepairListComponent;
  let vehicleServiceMock: jest.Mocked<VehicleService>;

  beforeEach(async () => {
    vehicleServiceMock = {
      postSearchRepairVehicle: jest.fn(),
      deleteRepairAsync: jest.fn(),
    } as unknown as jest.Mocked<VehicleService>;

    const dialogMock = {
      open: jest.fn(),
    };

    const snackBarMock = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HostComponent, NoopAnimationsModule],
      providers: [
        provideHttpClientTesting(),
        { provide: VehicleService, useValue: vehicleServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: { navigate: jest.fn() } },
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

  describe('columns', () => {
    it('should format maintenanceDate using datePipe', () => {
      // Arrange
      const item: RepairItem = {
        id: 1,
        date: '2023-01-01',
        description: 'Reparación',
        kmPerformed: 15000,
        serviceSupplierId: 1,
      };
      const col = component.columns.find(
        (c) => c.columnDef === 'maintenanceDate',
      );
      // Act
      const result = col && col.value ? col.value(item) : undefined;
      // Assert
      expect(result).toBe('01/01/2023');
    });

    it('should return description as is', () => {
      // Arrange
      const item: RepairItem = {
        id: 1,
        date: '2023-01-02',
        description: 'Cambio de correa',
        kmPerformed: 20000,
        serviceSupplierId: 1,
      };
      const col = component.columns.find((c) => c.columnDef === 'description');
      // Act
      const result = col && col.value ? col.value(item) : undefined;
      // Assert
      expect(result).toBe('Cambio de correa');
    });

    it('should format repairKm using decimalPipe', () => {
      // Arrange
      const item: RepairItem = {
        id: 1,
        date: '2023-01-03',
        description: 'Cambio de bujías',
        kmPerformed: 12345,
        serviceSupplierId: 1,
      };
      const col = component.columns.find((c) => c.columnDef === 'repairKm');
      // Act
      const result = col && col.value ? col.value(item) : undefined;
      // Assert
      expect(result).toBe('12,345 km');
    });

    it('should navigate with correct state when Modificar action is triggered', () => {
      // Arrange
      const routerMock = TestBed.inject(Router) as unknown as {
        navigate: jest.Mock;
      };
      const routeMock = TestBed.inject(ActivatedRoute);
      const item: RepairItem = {
        id: 5,
        date: '2024-10-01',
        description: 'Test Modificar',
        kmPerformed: 1234,
        serviceSupplierId: 42,
      };
      const col = component.columns.find((c) => c.columnDef === 'actions');
      // Act
      col?.actions?.[0].action(item);
      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['../mantenimiento/crear-reparacion'],
        {
          relativeTo: routeMock,
          state: {
            repair: {
              ...item,
              serviceSupplierId: item.serviceSupplierId,
            },
          },
        },
      );
    });
  });

  describe('pagination', () => {
    it('should update pageIndex and pageSize on handlePageChange', () => {
      // Arrange
      const event = { pageIndex: 2, pageSize: 25 };
      // Act
      component.handlePageChange(event);
      // Assert
      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(25);
    });
  });

  describe('search', () => {
    it('should reset pageIndex, set isLoading and emit on doSearchSubject$ when onSearchTextChange is called', () => {
      // Arrange
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      component.pageIndex = 5;
      component.isLoading = false;
      // Act
      component.onSearchTextChange();
      // Assert
      expect(component.pageIndex).toBe(0);
      expect(component.isLoading).toBe(true);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('ngOnInit', () => {
    it('should fetch data and map results on success', async () => {
      // Arrange
      const apiResponse = {
        results: [
          {
            id: 1,
            date: '2023-01-01',
            description: 'Cambio',
            kmPerformed: 1000,
            serviceSupplierId: 1,
          },
        ],
        total: 1,
      };
      vehicleServiceMock.postSearchRepairVehicle.mockReturnValue(
        of(apiResponse),
      );
      component.ngOnInit();

      // Act
      component.doSearchSubject$.next();

      // Assert
      component.dataSource$.subscribe((data) => {
        expect(data).toEqual([
          { date: '2023-01-01', description: 'Cambio', kmPerformed: 1000 },
        ]);
        expect(component.itemsNumber).toBe(1);
        expect(component.isLoading).toBe(false);
      });
    });

    it('should handle error and clear data', () => {
      // Arrange
      vehicleServiceMock.postSearchRepairVehicle.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      // Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      // Assert
      component.dataSource$.subscribe((data) => {
        expect(data).toEqual([]);
      });
      expect(component.itemsNumber).toBe(0);
      expect(component.isLoading).toBe(false);
    });

    it('should build params correctly and call the service with vehicleId and params', fakeAsync(() => {
      // Arrange
      const apiResponse = { results: [], total: 0 };
      vehicleServiceMock.postSearchRepairVehicle.mockReturnValue(
        of(apiResponse),
      );
      hostComponent.vehicleId = 77;
      hostFixture.detectChanges();
      component.searchText = 'something';
      component.pageIndex = 2;
      component.pageSize = 15;
      component.ngOnInit();
      // Act
      component.doSearchSubject$.next();
      tick(500);
      // Assert
      expect(vehicleServiceMock.postSearchRepairVehicle).toHaveBeenCalledWith(
        77,
        {
          searchText: 'something',
          page: 3,
          pageSize: 15,
        },
      );
    }));

    it('should map the results and update dataSource$, itemsNumber and isLoading on success', fakeAsync(async () => {
      // Arrange
      const apiResponse = {
        results: [
          {
            id: 1,
            date: '2023-01-01',
            description: 'Change',
            kmPerformed: 1000,
            serviceSupplierId: 1,
          },
          {
            id: 2,
            date: '2023-01-02',
            description: 'Other',
            kmPerformed: 2000,
            serviceSupplierId: 1,
          },
        ],
        total: 2,
      };
      vehicleServiceMock.postSearchRepairVehicle.mockReturnValue(
        of(apiResponse),
      );
      component.ngOnInit();
      // Act
      component.doSearchSubject$.next();
      tick(500);
      // Assert
      const data = await firstValueFrom(component.dataSource$);
      expect(data).toEqual([
        {
          id: 1,
          date: '2023-01-01',
          description: 'Change',
          kmPerformed: 1000,
          serviceSupplierId: 1,
        },
        {
          id: 2,
          date: '2023-01-02',
          description: 'Other',
          kmPerformed: 2000,
          serviceSupplierId: 1,
        },
      ]);
      expect(component.itemsNumber).toBe(2);
      expect(component.isLoading).toBe(false);
    }));

    it('should clear dataSource$, itemsNumber and isLoading on error', fakeAsync(async () => {
      // Arrange
      vehicleServiceMock.postSearchRepairVehicle.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      component.isLoading = true;
      component.ngOnInit();
      // Act
      component.doSearchSubject$.next();
      tick(500);
      // Assert
      expect(component.isLoading).toBe(false);
    }));
  });

  describe('handlePageChange', () => {
    it('should update pageIndex, pageSize and trigger search', () => {
      // Arrange
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      const event = { pageIndex: 2, pageSize: 25 };
      // Act
      component.handlePageChange(event);
      // Assert
      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(25);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('onClearSearch', () => {
    it('should clear searchText and trigger search', () => {
      // Arrange
      component.searchText = 'test';
      const spy = jest.spyOn(component, 'onSearchTextChange');
      // Act
      component.onClearSearch();
      // Assert
      expect(component.searchText).toBe('');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('onSearchTextChange', () => {
    it('should reset pageIndex, set isLoading and trigger search', () => {
      // Arrange
      component.pageIndex = 5;
      component.isLoading = false;
      const spy = jest.spyOn(component.doSearchSubject$, 'next');
      // Act
      component.onSearchTextChange();
      // Assert
      expect(component.pageIndex).toBe(0);
      expect(component.isLoading).toBe(true);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('deleteRepairWithConfirmation', () => {
    const repair: RepairItem = {
      id: 123,
      date: '2024-01-01',
      description: 'Test repair',
      kmPerformed: 1000,
      serviceSupplierId: 1,
    };

    it('should call deleteRepairWithConfirmation when Eliminar action is triggered', () => {
      // Arrange
      const dialogMock = TestBed.inject(MatDialog) as unknown as {
        open: jest.Mock;
      };
      dialogMock.open.mockReturnValue({
        afterClosed: () => ({
          subscribe: (cb: (result: boolean) => void) => cb(false),
        }),
      });
      const col = component.columns.find((c) => c.columnDef === 'actions');
      const spy = jest.spyOn(component, 'deleteRepairWithConfirmation');
      // Act
      col?.actions?.[1].action(repair);
      // Assert
      expect(spy).toHaveBeenCalledWith(repair);
      spy.mockRestore();
    });

    it('should call deleteRepairAsync, doSearchSubject$.next and snackBar.open when dialog is confirmed', () => {
      // Arrange
      const dialogMock = TestBed.inject(MatDialog) as unknown as {
        open: jest.Mock;
      };
      const snackBarMock = TestBed.inject(MatSnackBar) as unknown as {
        open: jest.Mock;
      };
      dialogMock.open.mockReturnValue({
        afterClosed: () => ({
          subscribe: (cb: (result: boolean) => void) => cb(true),
        }),
      });
      vehicleServiceMock.deleteRepairAsync.mockReturnValue(of(void 0));
      const doSearchSpy = jest.spyOn(component.doSearchSubject$, 'next');
      // Act
      component.deleteRepairWithConfirmation(repair);
      // Assert
      expect(dialogMock.open).toHaveBeenCalled();
      expect(vehicleServiceMock.deleteRepairAsync).toHaveBeenCalledWith(123);
      expect(doSearchSpy).toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Reparación eliminada exitosamente',
        'Cerrar',
        { duration: 3000 },
      );
      doSearchSpy.mockRestore();
    });

    it('should not call deleteRepairAsync or snackBar.open when dialog is cancelled', () => {
      // Arrange
      const dialogMock = TestBed.inject(MatDialog) as unknown as {
        open: jest.Mock;
      };
      const snackBarMock = TestBed.inject(MatSnackBar) as unknown as {
        open: jest.Mock;
      };
      dialogMock.open.mockReturnValue({
        afterClosed: () => ({
          subscribe: (cb: (result: boolean) => void) => cb(false),
        }),
      });
      // Act
      component.deleteRepairWithConfirmation(repair);
      // Assert
      expect(vehicleServiceMock.deleteRepairAsync).not.toHaveBeenCalled();
      expect(snackBarMock.open).not.toHaveBeenCalled();
    });
  });
});
