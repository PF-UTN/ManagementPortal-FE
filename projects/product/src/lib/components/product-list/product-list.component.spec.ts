import { LateralDrawerService } from '@Common-UI';

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
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product.service';
import { mockProductListItems, mockProductListItem } from '../../testing';
import { DetailLateralDrawerComponent } from '../detail-lateral-drawer/detail-lateral-drawer.component';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let service: DeepMockProxy<ProductService>;
  let lateralDrawerService: DeepMockProxy<LateralDrawerService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductListComponent,
        BrowserAnimationsModule,
        MatPaginatorModule,
        CommonModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
      ],
      providers: [
        {
          provide: ProductService,
          useValue: mockDeep<ProductService>(),
        },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.inject(ProductService) as DeepMockProxy<ProductService>;
    lateralDrawerService = TestBed.inject(
      LateralDrawerService,
    ) as DeepMockProxy<LateralDrawerService>;
    service.postSearchProduct.mockReturnValue(
      of({ total: mockProductListItems.length, results: mockProductListItems }),
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch data on init and update dataSource$', fakeAsync(() => {
      //Act
      component.ngOnInit();
      tick(1100);

      //Assert
      expect(component.dataSource$.value).toEqual(mockProductListItems);
    }));
    it('should fetch data on init and update itemsNumber', fakeAsync(() => {
      //Act
      component.ngOnInit();
      tick(1100);

      //Assert
      expect(component.itemsNumber).toBe(mockProductListItems.length);
    }));
    it('should fetch data on init and update isLoading', fakeAsync(() => {
      //Act
      component.ngOnInit();
      tick(1100);

      //Assert
      expect(component.isLoading).toBe(false);
    }));
    it('should handle errors when fetch Products fails', fakeAsync(() => {
      // Arrange
      service.postSearchProduct.mockReturnValueOnce(
        throwError(() => new Error('Test error')),
      );

      // Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(1100);
      fixture.detectChanges();

      // Assert
      expect(component.isLoading).toBe(false);
    }));
    it('should send selectedCategory as filter', fakeAsync(() => {
      // Arrange
      component.selectedCategories = ['Category 1', 'Category 2'];
      service.postSearchProduct.mockReturnValueOnce(
        of({ total: 0, results: [] }),
      );

      // Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(1000);
      fixture.detectChanges();

      // Assert
      expect(service.postSearchProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { categoryName: ['Category 1', 'Category 2'] },
        }),
      );
    }));
    it('should send selectedSupplier as filter', fakeAsync(() => {
      // Arrange
      component.selectedSuppliers = ['Supplier 1', 'Supplier 2'];
      service.postSearchProduct.mockReturnValueOnce(
        of({ total: 0, results: [] }),
      );

      // Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(1000);
      fixture.detectChanges();

      // Assert
      expect(service.postSearchProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { supplierBusinessName: ['Supplier 1', 'Supplier 2'] },
        }),
      );
    }));
    it('should send selectedEnabled as filter', fakeAsync(() => {
      // Arrange
      component.selectedEnabled = true;
      service.postSearchProduct.mockReturnValueOnce(
        of({ total: 0, results: [] }),
      );

      // Act
      component.ngOnInit();
      component.doSearchSubject$.next();
      tick(1000);
      fixture.detectChanges();

      // Assert
      expect(service.postSearchProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { enabled: true },
        }),
      );
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
  describe('debounceTime in doSearchSubject$', () => {
    it('should trigger the request only after the debounce time and only once for rapid consecutive triggers', fakeAsync(() => {
      // Arrange
      component.ngOnInit();
      const spy = jest.spyOn(service, 'postSearchProduct');

      // Act
      component.doSearchSubject$.next();
      tick(300);
      component.doSearchSubject$.next();
      tick(300);
      component.doSearchSubject$.next();
      expect(spy).not.toHaveBeenCalled();
      tick(1100);
      fixture.detectChanges();

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
    }));
  });
  describe('onEnabledFilterChange', () => {
    it('should reset pageIndex and trigger doSearchSubject$', () => {
      // Arrange
      component.pageIndex = 2;
      const nextSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onEnabledFilterChange();

      // Assert
      expect(component.pageIndex).toBe(0);
      expect(nextSpy).toHaveBeenCalled();
    });

    it('should send selectedEnabled as filter when changed', fakeAsync(() => {
      // Arrange
      component.ngOnInit();
      component.selectedEnabled = true;
      service.postSearchProduct.mockReturnValueOnce(
        of({ total: 0, results: [] }),
      );

      // Act
      component.doSearchSubject$.next();
      tick(1000);

      // Assert
      expect(service.postSearchProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { enabled: true },
        }),
      );
    }));
  });
  describe('onCategoryFilterChange', () => {
    it('should send selectedCategory as filter when changed', fakeAsync(() => {
      // Arrange
      component.ngOnInit();
      component.selectedCategories = ['Category 1', 'Category 2'];
      service.postSearchProduct.mockReturnValueOnce(
        of({ total: 0, results: [] }),
      );

      // Act
      component.doSearchSubject$.next();
      tick(1000);

      // Assert
      expect(service.postSearchProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { categoryName: ['Category 1', 'Category 2'] },
        }),
      );
    }));
  });
  describe('onSupplierFilterChange', () => {
    it('should send selectedCategory as filter when changed', fakeAsync(() => {
      // Arrange
      component.ngOnInit();
      component.selectedSuppliers = ['Supplier 1', 'Supplier 2'];
      service.postSearchProduct.mockReturnValueOnce(
        of({ total: 0, results: [] }),
      );

      // Act
      component.doSearchSubject$.next();
      tick(1000);

      // Assert
      expect(service.postSearchProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { supplierBusinessName: ['Supplier 1', 'Supplier 2'] },
        }),
      );
    }));
  });
  describe('onDetailDraawer', () => {
    it('should open drawer with productId and correct config', () => {
      // Act
      component.onDetailDrawer(mockProductListItem);

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalledWith(
        DetailLateralDrawerComponent,
        { productId: mockProductListItem.id },
        expect.objectContaining({
          title: 'Detalle del Producto',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({
              text: 'Cancelar',
              click: expect.any(Function),
            }),
          }),
        }),
      );
    });
  });
});
