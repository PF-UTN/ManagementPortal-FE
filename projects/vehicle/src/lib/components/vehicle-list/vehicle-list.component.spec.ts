import {
  downloadFileFromResponse,
  VehicleService,
  VehicleListItem,
} from '@Common';
import { LateralDrawerService, ModalComponent } from '@Common-UI';

import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
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
import { mockVehicleListItems } from '../../testing/mock-data.model';

jest.mock('@Common', () => {
  const actual = jest.requireActual('@Common');
  return {
    ...actual,
    downloadFileFromResponse: jest.fn(),
  };
});

describe('VehicleListComponent', () => {
  let component: VehicleListComponent;
  let fixture: ComponentFixture<VehicleListComponent>;
  let service: VehicleService;
  let lateralDrawerService: LateralDrawerService;
  let decimalPipe: DecimalPipe;
  let datePipe: DatePipe;

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
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        DecimalPipe,
        DatePipe,
      ],
    }).compileComponents();

    service = TestBed.inject(VehicleService);
    decimalPipe = TestBed.inject(DecimalPipe);
    datePipe = TestBed.inject(DatePipe);
    lateralDrawerService = TestBed.inject(LateralDrawerService);

    jest.spyOn(lateralDrawerService, 'open').mockReturnValue(of(void 0));

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
        admissionDate: '2024-07-31T00:00:00.000Z',
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
      actionsColumn?.actions
        ?.find((action) => action.description === 'Eliminar')
        ?.action(vehicle);
      tick();
      fixture.detectChanges();

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
        admissionDate: '2024-07-31T00:00:00.000Z',
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
      reloadSpy.mockClear();

      // Act → call delete action (index 0)
      const actionsColumn = component.columns.find(
        (c) => c.columnDef === 'actions',
      );
      actionsColumn?.actions?.[0].action(vehicle);
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
      jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.openCreateVehicleDrawer();

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalled();
      expect(component.doSearchSubject$.next).toHaveBeenCalled();
    });

    it('should call lateralDrawerService.close when Cancelar is clicked', () => {
      // Arrange
      // Act
      component.openCreateVehicleDrawer();
      const config = jest.spyOn(lateralDrawerService, 'open').mock.calls[0][2];
      config?.footer.secondButton?.click();

      // Assert
      expect(lateralDrawerService.close).toHaveBeenCalled();
    });

    it('should open the drawer with data when Editar is clicked and refresh the list after closing', () => {
      // Arrange
      jest.spyOn(component.doSearchSubject$, 'next');
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Test',
        enabled: true,
        kmTraveled: 100,
        admissionDate: '2024-07-31T00:00:00.000Z',
      };

      // Act
      const actionsColumn = component.columns.find(
        (c) => c.columnDef === 'actions',
      );
      expect(actionsColumn).toBeDefined();
      expect(actionsColumn?.actions).toBeDefined();
      const editAction = actionsColumn?.actions?.find(
        (a) => a.description === 'Modificar',
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
    it('should format kmTraveled with thousands separator and unit when kmTraveled is a number', () => {
      // Arrange
      const item: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Test',
        enabled: true,
        kmTraveled: 300000,
        admissionDate: '2024-07-31T00:00:00.000Z',
      };
      const kmColumn = component.columns.find(
        (c) => c.columnDef === 'kmTraveled',
      );
      expect(kmColumn).toBeDefined();
      expect(kmColumn?.value).toBeDefined();

      // Act
      const kmValue = kmColumn!.value!(item);

      // Assert
      expect(kmValue).toBe(
        decimalPipe.transform(item.kmTraveled, '1.0-0')! + ' km',
      );
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
        admissionDate: new Date('2024-07-31T00:00:00.000Z').toISOString(),
      };
      const admissionDateColumn = component.columns.find(
        (c) => c.columnDef === 'admissionDate',
      );

      // Act
      const admissionDateValue = admissionDateColumn!.value!(item);

      // Assert
      expect(admissionDateValue).toBe(
        datePipe.transform(item.admissionDate, 'dd/MM/yyyy')!,
      );
    });
  });

  describe('actions column', () => {
    it('should open the detail drawer with correct data when "Ver Detalle" is clicked', () => {
      // Arrange
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Test',
        enabled: true,
        kmTraveled: 100,
        admissionDate: '2024-07-31T00:00:00.000Z',
      };

      // Act
      const actionsColumn = component.columns.find(
        (c) => c.columnDef === 'actions',
      );
      expect(actionsColumn).toBeDefined();
      const detailAction = actionsColumn?.actions?.find(
        (a) => a.description === 'Ver Detalle',
      );
      expect(detailAction).toBeDefined();
      detailAction?.action(vehicle);

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalledWith(
        expect.any(Function),
        { data: vehicle },
        expect.objectContaining({
          title: 'Detalles de Vehículo',
        }),
      );
    });

    it('should open confirm modal and call updateVehicleAsync with toggled enabled when "Deshabilitar/Habilitar" is clicked and confirmed', fakeAsync(() => {
      // Arrange
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Test',
        enabled: true,
        kmTraveled: 100,
        admissionDate: '2024-07-31T00:00:00.000Z',
      };

      const dialogRefMock: Partial<MatDialogRef<ModalComponent, boolean>> = {
        afterClosed: () => of(true),
      };

      jest
        .spyOn(component['dialog'], 'open')
        .mockReturnValue(
          dialogRefMock as MatDialogRef<ModalComponent, boolean>,
        );

      const updateSpy = jest
        .spyOn(service, 'updateVehicleAsync')
        .mockReturnValue(of(void 0));
      const snackSpy = jest.spyOn(component['snackBar'], 'open');
      const reloadSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      const actionsColumn = component.columns.find(
        (c) => c.columnDef === 'actions',
      );
      const enableAction = actionsColumn?.actions?.find(
        (a) => a.description === 'Habilitar / Deshabilitar',
      );
      enableAction?.action(vehicle);
      tick();

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(
        vehicle.id,
        expect.objectContaining({
          enabled: false, // toggled value
        }),
      );
      expect(snackSpy).toHaveBeenCalledWith(
        'Vehículo deshabilitado correctamente',
        'Cerrar',
        { duration: 3000 },
      );
      expect(reloadSpy).toHaveBeenCalled();
    }));

    it('should not call updateVehicleAsync if "Deshabilitar/Habilitar" is cancelled', fakeAsync(() => {
      // Arrange
      const vehicle: VehicleListItem = {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Test',
        enabled: false,
        kmTraveled: 100,
        admissionDate: '2024-07-31T00:00:00.000Z',
      };

      const dialogRefMock: Partial<MatDialogRef<ModalComponent, boolean>> = {
        afterClosed: () => of(false),
      };

      jest
        .spyOn(component['dialog'], 'open')
        .mockReturnValue(
          dialogRefMock as MatDialogRef<ModalComponent, boolean>,
        );

      const updateSpy = jest.spyOn(service, 'updateVehicleAsync');
      const snackSpy = jest.spyOn(component['snackBar'], 'open');
      const reloadSpy = jest.spyOn(component.doSearchSubject$, 'next');
      reloadSpy.mockClear();

      // Act
      const actionsColumn = component.columns.find(
        (c) => c.columnDef === 'actions',
      );
      const enableAction = actionsColumn?.actions?.find(
        (a) => a.description === 'Habilitar / Deshabilitar',
      );
      enableAction?.action(vehicle);
      tick();

      // Assert
      expect(updateSpy).not.toHaveBeenCalled();
      expect(snackSpy).not.toHaveBeenCalled();
      expect(reloadSpy).not.toHaveBeenCalled();
    }));
  });

  describe('handleDownloadClick', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call vehicleService.downloadVehicleList with correct params and trigger file download', () => {
      // Arrange
      const params = {
        page: component.pageIndex + 1,
        pageSize: component.pageSize,
        searchText: component.searchText,
      };
      const mockHttpResponse = new HttpResponse({
        body: new Blob(['test'], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        status: 200,
        statusText: 'OK',
      });
      jest
        .spyOn(service, 'downloadVehicleList')
        .mockReturnValue(of(mockHttpResponse));

      // Act
      component.handleDownloadClick();

      // Assert
      expect(service.downloadVehicleList).toHaveBeenCalledWith(params);
      expect(downloadFileFromResponse).toHaveBeenCalledWith(
        mockHttpResponse,
        'vehiculos.xlsx',
      );
    });

    it('should handle errors from vehicleService.downloadVehicleList', () => {
      // Arrange
      jest
        .spyOn(service, 'downloadVehicleList')
        .mockReturnValueOnce(throwError(() => new Error('Download error')));

      // Act
      component.handleDownloadClick();

      // Assert
      expect(downloadFileFromResponse).not.toHaveBeenCalled();
    });
  });
});
