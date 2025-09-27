import { ModalComponent } from '@Common-UI';
import { VehicleService } from '@Vehicle';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { throwError, of } from 'rxjs';

import { MaintenanceListComponent } from './maintenance-list.component';
import { MaintenanceItem } from '../../models/maintenance-item.model';

describe('MaintenanceListComponent', () => {
  let component: MaintenanceListComponent;
  let fixture: ComponentFixture<MaintenanceListComponent>;
  let vehicleService: jest.Mocked<VehicleService>;

  beforeEach(async () => {
    const vehicleServiceMock = {
      postSearchMaintenanceVehicle: jest.fn(),
      deleteMaintenanceItem: jest.fn(),
    } as unknown as jest.Mocked<VehicleService>;

    await TestBed.configureTestingModule({
      imports: [MaintenanceListComponent, NoopAnimationsModule],
      providers: [
        provideHttpClientTesting(),
        { provide: VehicleService, useValue: vehicleServiceMock },
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
      };
      const col = component.columns.find((c) => c.columnDef === 'kmPerformed');
      // Act
      const result = col && col.value ? col.value(item) : undefined;
      // Assert
      expect(result).toBe('12,345 km');
    });

    it('should call action handlers for actions column', () => {
      // Arrange
      const item: MaintenanceItem = {
        id: 1,
        date: '01/01/1999',
        description: 'Cambio de bujías',
        kmPerformed: 30000,
      };
      const col = component.columns.find((c) => c.columnDef === 'actions');
      const spyLog = jest.spyOn(console, 'log').mockImplementation();
      const spyDelete = jest
        .spyOn(component, 'deleteMaintenanceItem')
        .mockImplementation();
      // Act
      col?.actions?.[0].action(item);
      col?.actions?.[1].action(item);
      // Assert
      expect(spyLog).toHaveBeenCalledWith('Modificar', item);
      expect(spyDelete).toHaveBeenCalledWith(item);
      spyLog.mockRestore();
      spyDelete.mockRestore();
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
    it('should call deleteMaintenanceItem on service and show snackbar when confirmed', () => {
      // Arrange
      const item: MaintenanceItem = {
        id: 1,
        date: '01/01/2023',
        description: 'Cambio de aceite',
        kmPerformed: 15000,
      };
      const dialogRefMock: Partial<MatDialogRef<ModalComponent, boolean>> = {
        afterClosed: () => of(true),
      };
      const dialogSpy = jest
        .spyOn(component['dialog'], 'open')
        .mockReturnValue(
          dialogRefMock as MatDialogRef<ModalComponent, boolean>,
        );
      const deleteSpy = jest
        .spyOn(vehicleService, 'deleteMaintenanceItem')
        .mockReturnValue(of(void 0));
      const ngOnInitSpy = jest.spyOn(component, 'ngOnInit');
      const snackBarSpy = jest.spyOn(component['snackBar'], 'open');
      // Act
      component.deleteMaintenanceItem(item);
      // Assert
      expect(dialogSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledWith(item.id);
      expect(ngOnInitSpy).toHaveBeenCalled();
      expect(snackBarSpy).toHaveBeenCalledWith(
        'Mantenimiento eliminado exitosamente',
        'Cerrar',
        { duration: 3000 },
      );
      dialogSpy.mockRestore();
      deleteSpy.mockRestore();
      ngOnInitSpy.mockRestore();
      snackBarSpy.mockRestore();
    });

    it('should not call deleteMaintenanceItem on service if dialog is cancelled', () => {
      // Arrange
      const item: MaintenanceItem = {
        id: 1,
        date: '01/01/2023',
        description: 'Cambio de aceite',
        kmPerformed: 15000,
      };
      const dialogRefMock: Partial<MatDialogRef<ModalComponent, boolean>> = {
        afterClosed: () => of(false),
      };
      const dialogSpy = jest
        .spyOn(component['dialog'], 'open')
        .mockReturnValue(
          dialogRefMock as MatDialogRef<ModalComponent, boolean>,
        );
      const deleteSpy = jest.spyOn(vehicleService, 'deleteMaintenanceItem');
      // Act
      component.deleteMaintenanceItem(item);
      // Assert
      expect(dialogSpy).toHaveBeenCalled();
      expect(deleteSpy).not.toHaveBeenCalled();
      dialogSpy.mockRestore();
      deleteSpy.mockRestore();
    });

    it('should set isLoading to false if deleteMaintenanceItem fails', () => {
      // Arrange
      const item: MaintenanceItem = {
        id: 1,
        date: '01/01/2023',
        description: 'Cambio de aceite',
        kmPerformed: 15000,
      };
      const dialogRefMock: Partial<MatDialogRef<ModalComponent, boolean>> = {
        afterClosed: () => of(true),
      };
      const dialogSpy = jest
        .spyOn(component['dialog'], 'open')
        .mockReturnValue(
          dialogRefMock as MatDialogRef<ModalComponent, boolean>,
        );
      jest
        .spyOn(vehicleService, 'deleteMaintenanceItem')
        .mockReturnValue(throwError(() => new Error('fail')));
      component.isLoading = true;
      // Act
      component.deleteMaintenanceItem(item);
      // Assert
      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        dialogSpy.mockRestore();
      }, 0);
    });
  });
});
