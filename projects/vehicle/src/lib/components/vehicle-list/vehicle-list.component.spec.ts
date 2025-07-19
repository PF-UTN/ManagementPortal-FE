import { VehicleService } from '@Vehicle';

import { CommonModule } from '@angular/common';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { VehicleListComponent } from './vehicle-list.component';
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
  });
});
