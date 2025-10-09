import { VehicleService } from '@Common';
import { ModalComponent } from '@Common-UI';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MaintenanceListComponent } from './maintenance-list.component';
import { MaintenanceItem } from '../../../../../common/src/models/vehicle/maintenance-item.model';

describe('MaintenanceListComponent', () => {
  let component: MaintenanceListComponent;
  let fixture: ComponentFixture<MaintenanceListComponent>;
  let vehicleService: jest.Mocked<VehicleService>;

  beforeEach(async () => {
    const vehicleServiceMock = {
      postSearchMaintenanceVehicle: jest.fn(),
      deleteMaintenanceItem: jest.fn(),
    } as unknown as jest.Mocked<VehicleService>;

    const dialogMock = {
      open: jest.fn(),
    };

    const snackBarMock = {
      open: jest.fn(),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MaintenanceListComponent, NoopAnimationsModule],
      providers: [
        provideHttpClientTesting(),
        { provide: VehicleService, useValue: vehicleServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenanceListComponent);
    component = fixture.componentInstance;
    vehicleService = TestBed.inject(
      VehicleService,
    ) as jest.Mocked<VehicleService>;
    component.vehicleId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('columns', () => {
    it('should format maintenanceDate using datePipe', () => {
      // Arrange
      const item: MaintenanceItem = {
        id: 1,
        date: '01/01/2023',
        description: 'Cambio de aceite',
        kmPerformed: 15000,
        serviceSupplierId: 1,
      };
      const col = component.columns.find((c) => c.columnDef === 'date');
      // Act
      const result = col && col.value ? col.value(item) : undefined;
      // Assert
      expect(result).toBe('01/01/2023');
    });

    it('should return description as is', () => {
      // Arrange
      const item: MaintenanceItem = {
        id: 1,
        date: '01/01/1999',
        description: 'Filtro de aire',
        kmPerformed: 20000,
        serviceSupplierId: 1,
      };
      const col = component.columns.find((c) => c.columnDef === 'description');
      // Act
      const result = col && col.value ? col.value(item) : undefined;
      // Assert
      expect(result).toBe('Filtro de aire');
    });

    it('should format kmPerformed using decimalPipe', () => {
      // Arrange
      const item: MaintenanceItem = {
        id: 1,
        date: '01/01/1999',
        description: 'Cambio de correa',
        kmPerformed: 12345,
        serviceSupplierId: 1,
      };
      const col = component.columns.find((c) => c.columnDef === 'kmPerformed');
      // Act
      const result = col && col.value ? col.value(item) : undefined;
      // Assert
      expect(result).toBe('12,345 km');
    });

    it('should call router.navigate with correct params when Modificar action is triggered', () => {
      // Arrange
      const item: MaintenanceItem = {
        id: 1,
        date: '01/01/1999',
        description: 'Cambio de bujías',
        kmPerformed: 30000,
        serviceSupplierId: 1,
      };
      const col = component.columns.find((c) => c.columnDef === 'actions');
      const router = TestBed.inject(Router);
      const routerSpy = jest.spyOn(router, 'navigate').mockImplementation();

      // Act
      col?.actions?.[0].action(item);

      // Assert
      expect(routerSpy).toHaveBeenCalledWith(['realizar', item.id], {
        relativeTo: TestBed.inject(ActivatedRoute),
        state: { maintenance: item },
      });
      routerSpy.mockRestore();
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
    it('should handle error and clear data', () => {
      // Arrange
      vehicleService.postSearchMaintenanceVehicle.mockReturnValue(
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

  describe('deleteMaintenanceItem', () => {
    it('should open the modal, call delete service, refresh list and show snackbar on confirm', () => {
      // Arrange
      const item: MaintenanceItem = {
        id: 123,
        date: '2023-01-01',
        description: 'Cambio de aceite',
        kmPerformed: 15000,
        serviceSupplierId: 1,
      };
      const dialogRefMock: Partial<MatDialogRef<ModalComponent, boolean>> = {
        afterClosed: () => of(true),
      };
      const dialog = TestBed.inject(MatDialog);
      const dialogSpy = jest
        .spyOn(dialog, 'open')
        .mockReturnValue(
          dialogRefMock as MatDialogRef<ModalComponent, boolean>,
        );
      const vehicleService = TestBed.inject(VehicleService);
      const deleteSpy = jest
        .spyOn(vehicleService, 'deleteMaintenanceItem')
        .mockReturnValue(of(void 0));
      const ngOnInitSpy = jest.spyOn(component, 'ngOnInit');
      const snackBar = TestBed.inject(MatSnackBar);
      const snackBarSpy = jest.spyOn(snackBar, 'open');

      // Act
      component.deleteMaintenanceItem(item);

      // Assert
      expect(dialogSpy).toHaveBeenCalledWith(
        ModalComponent,
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'ELIMINAR MANTENIMIENTO',
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
      const item: MaintenanceItem = {
        id: 123,
        date: '2023-01-01',
        description: 'Cambio de aceite',
        kmPerformed: 15000,
        serviceSupplierId: 1,
      };
      const dialogRefMock: Partial<MatDialogRef<ModalComponent, boolean>> = {
        afterClosed: () => of(false),
      };
      const dialog = TestBed.inject(MatDialog);
      jest
        .spyOn(dialog, 'open')
        .mockReturnValue(
          dialogRefMock as MatDialogRef<ModalComponent, boolean>,
        );
      const vehicleService = TestBed.inject(VehicleService);
      const deleteSpy = jest.spyOn(vehicleService, 'deleteMaintenanceItem');

      // Act
      component.deleteMaintenanceItem(item);

      // Assert
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should show error snackbar if deletion fails', () => {
      // Arrange
      const item: MaintenanceItem = {
        id: 123,
        date: '2023-01-01',
        description: 'Cambio de aceite',
        kmPerformed: 15000,
        serviceSupplierId: 1,
      };
      const dialogRefMock: Partial<MatDialogRef<ModalComponent, boolean>> = {
        afterClosed: () => of(true),
      };
      const dialog = TestBed.inject(MatDialog);
      jest
        .spyOn(dialog, 'open')
        .mockReturnValue(
          dialogRefMock as MatDialogRef<ModalComponent, boolean>,
        );
      const vehicleService = TestBed.inject(VehicleService);
      jest
        .spyOn(vehicleService, 'deleteMaintenanceItem')
        .mockReturnValue(throwError(() => new Error('fail')));
      const snackBar = TestBed.inject(MatSnackBar);
      const snackBarSpy = jest.spyOn(snackBar, 'open');

      // Act
      component.deleteMaintenanceItem(item);

      // Assert
      expect(snackBarSpy).toHaveBeenCalledWith(
        'Ocurrió un error al eliminar el mantenimiento.',
        'Cerrar',
        { duration: 4000 },
      );
      expect(component.isLoading).toBe(false);
    });
  });
});
