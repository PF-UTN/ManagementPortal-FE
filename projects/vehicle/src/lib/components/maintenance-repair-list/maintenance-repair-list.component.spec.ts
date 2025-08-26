import { VehicleService } from '@Vehicle';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { throwError, of } from 'rxjs';

import { MaintenanceRepairListComponent } from './maintenance-repair-list.component';
import { MaintenanceRepairItem } from '../../models/maintenance-rapir-item.model';

describe('MaintenanceRepairListComponent', () => {
  let component: MaintenanceRepairListComponent;
  let fixture: ComponentFixture<MaintenanceRepairListComponent>;
  let vehicleService: jest.Mocked<VehicleService>;

  beforeEach(async () => {
    const vehicleServiceMock = {
      postSearchRepairVehicle: jest.fn(),
    } as unknown as jest.Mocked<VehicleService>;

    await TestBed.configureTestingModule({
      imports: [MaintenanceRepairListComponent, NoopAnimationsModule],
      providers: [
        provideHttpClientTesting(),
        { provide: VehicleService, useValue: vehicleServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenanceRepairListComponent);
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
      const item: MaintenanceRepairItem = {
        date: '2023-01-01',
        description: 'Reparación',
        kmPerformed: 15000,
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
      const item: MaintenanceRepairItem = {
        date: '2023-01-02',
        description: 'Cambio de correa',
        kmPerformed: 20000,
      };
      const col = component.columns.find((c) => c.columnDef === 'description');
      // Act
      const result = col && col.value ? col.value(item) : undefined;
      // Assert
      expect(result).toBe('Cambio de correa');
    });

    it('should format repairKm using decimalPipe', () => {
      // Arrange
      const item: MaintenanceRepairItem = {
        date: '2023-01-03',
        description: 'Cambio de bujías',
        kmPerformed: 12345,
      };
      const col = component.columns.find((c) => c.columnDef === 'repairKm');
      // Act
      const result = col && col.value ? col.value(item) : undefined;
      // Assert
      expect(result).toBe('12,345 km');
    });

    it('should call action handlers for actions column', () => {
      // Arrange
      const item: MaintenanceRepairItem = {
        date: '2023-01-04',
        description: 'Cambio de filtro',
        kmPerformed: 30000,
      };
      const col = component.columns.find((c) => c.columnDef === 'actions');
      const spyLog = jest.spyOn(console, 'log').mockImplementation();
      // Act
      col?.actions?.[0].action(item); // Modificar
      col?.actions?.[1].action(item); // Eliminar
      // Assert
      expect(spyLog).toHaveBeenCalledWith('Modificar', item);
      expect(spyLog).toHaveBeenCalledWith('Eliminar', item);
      spyLog.mockRestore();
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
          },
        ],
        total: 1,
      };
      vehicleService.postSearchRepairVehicle.mockReturnValue(of(apiResponse));
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
      vehicleService.postSearchRepairVehicle.mockReturnValue(
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
});
