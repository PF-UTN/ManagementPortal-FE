import { VehicleService } from '@Vehicle';

import { DecimalPipe } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, firstValueFrom } from 'rxjs';

import { MaintenancePlanListComponent } from './maintenance-plan-list.component';
import { MaintenancePlanListItem } from '../../models/maintenance-plan.model';

describe('MaintenancePlanListComponent', () => {
  let component: MaintenancePlanListComponent;
  let fixture: ComponentFixture<MaintenancePlanListComponent>;

  beforeEach(async () => {
    const vehicleServiceMock = {
      postSearchMaintenancePlanItemVehicle: jest
        .fn()
        .mockReturnValue(of({ results: [], total: 0 })),
    } as unknown as jest.Mocked<VehicleService>;

    await TestBed.configureTestingModule({
      imports: [MaintenancePlanListComponent],
      providers: [
        DecimalPipe,
        provideHttpClientTesting(),
        { provide: VehicleService, useValue: vehicleServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenancePlanListComponent);
    component = fixture.componentInstance;
    component.vehicleId = 1;
    fixture.detectChanges();
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
      description: 'Cambio de correa',
      kmInterval: 50000,
      timeInterval: 24,
    };
    const actionsColumn = component.columns.find(
      (col) => col.columnDef === 'actions',
    );
    const spyRealizar = jest.spyOn(console, 'log');
    // Act
    actionsColumn?.actions?.[0].action(item);
    actionsColumn?.actions?.[1].action(item);
    actionsColumn?.actions?.[2].action(item);
    // Assert
    expect(spyRealizar).toHaveBeenCalledWith('Realizar', item);
    expect(spyRealizar).toHaveBeenCalledWith('Modificar', item);
    expect(spyRealizar).toHaveBeenCalledWith('Eliminar', item);
    spyRealizar.mockRestore();
  });

  describe('ngOnInit', () => {
    it('should fetch data and update dataSource$, itemsNumber and isLoading on success', async () => {
      // Arrange
      const mockResponse = {
        results: [
          {
            description: 'Cambio de aceite',
            kmInterval: 10000,
            timeInterval: 6,
          },
          {
            description: 'Cambio de filtro',
            kmInterval: 15000,
            timeInterval: 12,
          },
        ],
        total: 2,
      };
      const vehicleService = TestBed.inject(VehicleService);
      jest
        .spyOn(vehicleService, 'postSearchMaintenancePlanItemVehicle')
        .mockReturnValue(of(mockResponse));
      component.vehicleId = 1;
      // Act
      component.ngOnInit();
      // Assert
      const data = await firstValueFrom(component.dataSource$);
      expect(data).toEqual(mockResponse.results);
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
      component.vehicleId = 1;
      // Act
      component.ngOnInit();
      // Assert
      const data = await firstValueFrom(component.dataSource$);
      expect(data).toEqual([]);
      expect(component.itemsNumber).toBe(0);
      expect(component.isLoading).toBe(false);
    });
  });
});
