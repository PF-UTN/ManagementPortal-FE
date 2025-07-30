import { ModalComponent } from '@Common-UI';
import { VehicleService } from '@Vehicle';

import { CommonModule } from '@angular/common';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { VehicleListComponent } from './vehicle-list.component';
import { VehicleListItem } from '../../models/vehicle-item.model';
import { mockVehicleListItems } from '../../testing/mock-data,model';

describe('VehicleListComponent', () => {
  let component: VehicleListComponent;
  let fixture: ComponentFixture<VehicleListComponent>;
  let service: VehicleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VehicleListComponent,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        MatPaginatorModule,
        CommonModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
      ],
      providers: [
        {
          provide: VehicleService,
          useValue: mockDeep<VehicleService>(),
        },
      ],
    }).compileComponents();

    service = TestBed.inject(VehicleService);

    fixture = TestBed.createComponent(VehicleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('should fetch data on init and update dataSource$', fakeAsync(() => {
      //Arrange
      jest.spyOn(service, 'postSearchVehiclesAsync').mockReturnValue(
        of({
          total: mockVehicleListItems.length,
          results: mockVehicleListItems,
        }),
      );

      //Act
      component.ngOnInit();
      tick(1100);

      //Assert
      expect(component.dataSource$.value).toEqual(mockVehicleListItems);
    }));
    it('should fetch data on init and update itemsNumber', fakeAsync(() => {
      //Arrange
      jest.spyOn(service, 'postSearchVehiclesAsync').mockReturnValue(
        of({
          total: mockVehicleListItems.length,
          results: mockVehicleListItems,
        }),
      );

      //Act
      component.ngOnInit();
      tick(1100);

      //Assert
      expect(component.itemsNumber).toBe(mockVehicleListItems.length);
    }));
    it('should handle errors when fetch Vehicles fails', fakeAsync(() => {
      //Arrange
      jest
        .spyOn(service, 'postSearchVehiclesAsync')
        .mockReturnValueOnce(throwError(() => new Error('Error feching data')));

      // Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(1100);
      fixture.detectChanges();

      // Assert
      expect(component.isLoading).toBe(false);
    }));
  });
  describe('handlePageChange', () => {
    it('should update pageIndex doSearchSubject$', () => {
      // Arrange
      const event = { pageIndex: 1, pageSize: 20 };
      jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.handlePageChange(event);

      // Assert
      expect(component.pageIndex).toBe(1);
    });
    it('should update pageSize doSearchSubject$', () => {
      // Arrange
      const event = { pageIndex: 1, pageSize: 20 };
      jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.handlePageChange(event);

      // Assert
      expect(component.pageSize).toBe(20);
    });
    it('should call doSearchSubject$.next()', () => {
      // Arrange
      const event = { pageIndex: 1, pageSize: 20 };
      jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.handlePageChange(event);

      // Assert
      expect(component.doSearchSubject$.next).toHaveBeenCalled();
    });
  });
  describe('onSearchTextChange integration', () => {
    it('should fetch vehicles and update dataSource$ after searchText changes', fakeAsync(() => {
      // Arrange
      jest.spyOn(service, 'postSearchVehiclesAsync').mockReturnValue(
        of({
          total: mockVehicleListItems.length,
          results: mockVehicleListItems,
        }),
      );

      component.ngOnInit();
      component.pageIndex = 2;
      component.searchText = 'HJD';

      // Act

      component.onSearchTextChange();
      tick(2000);
      fixture.detectChanges();

      // Assert
      expect(component.dataSource$.value).toEqual(mockVehicleListItems);
      expect(component.pageIndex).toBe(0);
      expect(component.itemsNumber).toBe(2);
      expect(component.isLoading).toBe(false);
    }));
    it('should clear searchText and trigger search when onClearSearch is called', () => {
      // Arrange
      component.searchText = 'something';
      jest.spyOn(component, 'onSearchTextChange');

      // Act
      component.onClearSearch();

      // Assert
      expect(component.searchText).toBe('');
      expect(component.onSearchTextChange).toHaveBeenCalled();
    });
  });

  describe('deleteVehicle', () => {
    it('should delete vehicle, show snackbar and reload list on confirm', fakeAsync(() => {
      // Arrange
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Test',
        enabled: true,
        kmTraveled: 100,
        admissionDate: new Date(),
      };
      const dialogRefMock: Partial<MatDialogRef<ModalComponent, boolean>> = {
        afterClosed: () => of(true),
      };
      jest
        .spyOn(component['dialog'], 'open')
        .mockReturnValue(
          dialogRefMock as MatDialogRef<ModalComponent, boolean>,
        );
      const deleteSpy = jest
        .spyOn(service, 'deleteVehicleAsync')
        .mockReturnValue(of(void 0));
      const snackSpy = jest.spyOn(component['snackBar'], 'open');
      const reloadSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      const actionsColumn = component.columns.find(
        (c) => c.columnDef === 'actions',
      );
      expect(actionsColumn).toBeDefined();
      expect(actionsColumn?.actions).toBeDefined();
      actionsColumn?.actions?.[1].action(vehicle);
      tick();

      // Assert
      expect(deleteSpy).toHaveBeenCalledWith(vehicle.id);
      expect(snackSpy).toHaveBeenCalledWith(
        'Vehículo eliminado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
      expect(reloadSpy).toHaveBeenCalled();
    }));

    it('should not delete vehicle or show snackbar if delete is cancelled', fakeAsync(() => {
      // Arrange
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Test',
        enabled: true,
        kmTraveled: 100,
        admissionDate: new Date(),
      };
      const dialogRefMock: Partial<MatDialogRef<ModalComponent, boolean>> = {
        afterClosed: () => of(false),
      };
      jest
        .spyOn(component['dialog'], 'open')
        .mockReturnValue(
          dialogRefMock as MatDialogRef<ModalComponent, boolean>,
        );
      const deleteSpy = jest.spyOn(service, 'deleteVehicleAsync');
      const snackSpy = jest.spyOn(component['snackBar'], 'open');
      const reloadSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      const actionsColumn = component.columns.find(
        (c) => c.columnDef === 'actions',
      );
      expect(actionsColumn).toBeDefined();
      expect(actionsColumn?.actions).toBeDefined();
      actionsColumn?.actions?.[1].action(vehicle);
      tick();

      // Assert
      expect(deleteSpy).not.toHaveBeenCalled();
      expect(snackSpy).not.toHaveBeenCalled();
      expect(reloadSpy).not.toHaveBeenCalled();
    }));
  });

  describe('openCreateVehicleDrawer', () => {
    it('should open the drawer and refresh the list after closing', () => {
      // Arrange
      const lateralDrawerService = {
        open: jest.fn().mockReturnValue(of({})),
        close: jest.fn(),
      };
      Object.defineProperty(component, 'lateralDrawerService', {
        value: lateralDrawerService,
        writable: true,
      });
      jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.openCreateVehicleDrawer();

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalled();
      expect(component.doSearchSubject$.next).toHaveBeenCalled();
    });
    it('should call lateralDrawerService.close when Cancelar is clicked', () => {
      // Arrange
      const lateralDrawerService = {
        open: jest.fn().mockReturnValue(of({})),
        close: jest.fn(),
      };
      Object.defineProperty(component, 'lateralDrawerService', {
        value: lateralDrawerService,
        writable: true,
      });

      // Act
      component.openCreateVehicleDrawer();
      const config = lateralDrawerService.open.mock.calls[0][2];
      config.footer.secondButton.click();

      // Assert
      expect(lateralDrawerService.close).toHaveBeenCalled();
    });

    it('should open the drawer with data when Editar is clicked and refresh the list after closing', () => {
      // Arrange
      const lateralDrawerService = {
        open: jest.fn().mockReturnValue(of({})),
        close: jest.fn(),
      };
      Object.defineProperty(component, 'lateralDrawerService', {
        value: lateralDrawerService,
        writable: true,
      });
      jest.spyOn(component.doSearchSubject$, 'next');
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Test',
        enabled: true,
        kmTraveled: 100,
        admissionDate: new Date(),
      };

      // Act
      const actionsColumn = component.columns.find(
        (c) => c.columnDef === 'actions',
      );
      expect(actionsColumn).toBeDefined();
      expect(actionsColumn?.actions).toBeDefined();
      const editAction = actionsColumn?.actions?.find(
        (a) => a.description === 'Editar',
      );
      expect(editAction).toBeDefined();
      editAction?.action(vehicle);

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalledWith(
        expect.any(Function),
        { data: vehicle },
        expect.objectContaining({
          title: 'Editar Vehículo',
        }),
      );
      expect(component.doSearchSubject$.next).toHaveBeenCalled();
    });
  });

  describe('onButtonKeyDown', () => {
    it('should call openCreateVehicleDrawer when Enter is pressed', () => {
      // Arrange
      const openSpy = jest
        .spyOn(component, 'openCreateVehicleDrawer')
        .mockImplementation(() => {});
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      // Act
      component.onButtonKeyDown(event);

      // Assert
      expect(openSpy).toHaveBeenCalled();
    });

    it('should not call openCreateVehicleDrawer for other keys', () => {
      // Arrange
      const openSpy = jest.spyOn(component, 'openCreateVehicleDrawer');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      // Act
      component.onButtonKeyDown(event);

      // Assert
      expect(openSpy).not.toHaveBeenCalled();
    });
  });

  describe('Column formatting', () => {
    it('should format kmTraveled with thousands separator and unit', () => {
      // Arrange
      const item: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Test',
        enabled: true,
        kmTraveled: 300000,
        admissionDate: new Date(),
      };
      const kmColumn = component.columns.find(
        (c) => c.columnDef === 'kmTraveled',
      );
      expect(kmColumn).toBeDefined();
      expect(kmColumn?.value).toBeDefined();

      // Act
      const kmValue = kmColumn?.value?.(item);

      // Assert
      expect(kmValue).toBe('300.000 km');
    });

    it('should format kmTraveled with thousands separator and unit when kmTraveled is a number', () => {
      // Arrange
      const item: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Test',
        enabled: true,
        kmTraveled: 300000,
        admissionDate: new Date(),
      };
      const kmColumn = component.columns.find(
        (c) => c.columnDef === 'kmTraveled',
      );
      expect(kmColumn).toBeDefined();
      expect(kmColumn?.value).toBeDefined();

      // Act
      const kmValue = kmColumn!.value!(item);

      // Assert
      expect(kmValue).toBe('300.000 km');
    });

    it('should return empty string when kmTraveled is not a number', () => {
      // Arrange
      const item: VehicleListItem = {
        id: 2,
        licensePlate: 'XYZ789',
        brand: 'Ford',
        model: 'Focus',
        enabled: true,
        kmTraveled: NaN,
        admissionDate: new Date(),
      };
      const kmColumn = component.columns.find(
        (c) => c.columnDef === 'kmTraveled',
      );
      expect(kmColumn).toBeDefined();
      expect(kmColumn?.value).toBeDefined();

      // Act
      const kmValue = kmColumn!.value!(item);

      // Assert
      expect(kmValue).toBe('');
    });

    it('should format admissionDate as DD/MM/YYYY', () => {
      // Arrange
      const date = new Date(2024, 0, 1);
      // Act
      const formatted = component.formatDate(date);
      // Assert
      expect(formatted).toBe('01/01/2024');
    });
  });

  it('should parse string date and format as DD/MM/YYYY', () => {
    // Arrange
    const dateStr = new Date(2024, 0, 1);
    // Act
    const formatted = component.formatDate(dateStr);
    // Assert
    expect(formatted).toBe('01/01/2024');
  });

  it('should return empty string for invalid date', () => {
    // Arrange
    const invalidDate = 'not-a-date';
    // Act
    const formatted = component.formatDate(invalidDate);
    // Assert
    expect(formatted).toBe('');
  });
});
