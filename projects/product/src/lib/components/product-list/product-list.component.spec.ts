import { LateralDrawerService } from '@Common-UI';
import { ProductCategoryService } from '@Product-Category';
import { SupplierService } from '@Supplier';

import { CommonModule, registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
registerLocaleData(localeEsAr);
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
import { DeletedProductLateralDrawerComponent } from '../deleted-product-lateral-drawer/deleted-product-lateral-drawer.component';
import { DetailLateralDrawerComponent } from '../detail-lateral-drawer/detail-lateral-drawer.component';
import { ToggleProductLatearalDrawerComponent } from '../toggle-product-latearal-drawer/toggle-product-latearal-drawer.component';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let service: DeepMockProxy<ProductService>;
  let lateralDrawerService: DeepMockProxy<LateralDrawerService>;
  let productCategoryService: DeepMockProxy<ProductCategoryService>;
  let supplierService: DeepMockProxy<SupplierService>;

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
        {
          provide: ProductCategoryService,
          useValue: mockDeep<ProductCategoryService>(),
        },
        {
          provide: SupplierService,
          useValue: mockDeep<SupplierService>(),
        },
      ],
    }).compileComponents();

    service = TestBed.inject(ProductService) as DeepMockProxy<ProductService>;
    productCategoryService = TestBed.inject(
      ProductCategoryService,
    ) as DeepMockProxy<ProductCategoryService>;
    productCategoryService.getCategoriesAsync.mockReturnValue(of([]));

    supplierService = TestBed.inject(
      SupplierService,
    ) as DeepMockProxy<SupplierService>;
    supplierService.getSuppliersAsync.mockReturnValue(of([]));

    lateralDrawerService = TestBed.inject(
      LateralDrawerService,
    ) as DeepMockProxy<LateralDrawerService>;
    service.postSearchProduct.mockReturnValue(
      of({ total: mockProductListItems.length, results: mockProductListItems }),
    );

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
  describe('onDetailDrawer', () => {
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
              text: 'Cerrar',
              click: expect.any(Function),
            }),
          }),
        }),
      );
    });
  });

  describe('onDeleteDrawer', () => {
    it('should open DeleteLateralDrawerComponent with correct config and refresh list on close', () => {
      // Arrange
      const request = mockProductListItem;
      lateralDrawerService.open.mockReturnValue(of(void 0));
      const doSearchSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onDeleteDrawer(request);

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalledWith(
        DeletedProductLateralDrawerComponent,
        { productId: request.id },
        expect.objectContaining({
          title: 'Eliminar producto',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({
              text: 'Eliminar',
              click: expect.any(Function),
            }),
            secondButton: expect.objectContaining({
              text: 'Cancelar',
              click: expect.any(Function),
            }),
          }),
        }),
      );
      expect(doSearchSpy).toHaveBeenCalled();
    });
  });

  describe('onPauseDrawer', () => {
    it('should open ToggleProductLatearalDrawerComponent with correct config and refresh list on close (pausar)', () => {
      // Arrange
      const request = { ...mockProductListItem, enabled: true };
      lateralDrawerService.open.mockReturnValue(of(void 0));
      const doSearchSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onPauseDrawer(request);

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalledWith(
        ToggleProductLatearalDrawerComponent,
        { productId: request.id, isPause: true },
        expect.objectContaining({
          title: 'Pausar producto',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({
              text: 'Pausar',
              click: expect.any(Function),
            }),
            secondButton: expect.objectContaining({
              text: 'Cancelar',
              click: expect.any(Function),
            }),
          }),
        }),
      );
      expect(doSearchSpy).toHaveBeenCalled();
    });

    it('should open ToggleProductLatearalDrawerComponent with correct config and text "Reanudar" if product is paused', () => {
      // Arrange
      const request = { ...mockProductListItem, enabled: false };
      lateralDrawerService.open.mockReturnValue(of(void 0));
      const doSearchSpy = jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.onPauseDrawer(request);

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalledWith(
        ToggleProductLatearalDrawerComponent,
        { productId: request.id, isPause: true },
        expect.objectContaining({
          title: 'Pausar producto',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({
              text: 'Reanudar',
              click: expect.any(Function),
            }),
            secondButton: expect.objectContaining({
              text: 'Cancelar',
              click: expect.any(Function),
            }),
          }),
        }),
      );
      expect(doSearchSpy).toHaveBeenCalled();
    });
  });

  describe('onModifyProduct', () => {
    it('should navigate to the edit page with the correct id', () => {
      // Arrange
      const routerSpy = jest.spyOn(component['router'], 'navigate');
      const request = { ...mockProductListItem, id: 123 };

      // Act
      component.onModifyProduct(request);

      // Assert
      expect(routerSpy).toHaveBeenCalledWith(['/productos/editar', 123]);
    });
  });

  describe('onModifyProductStock', () => {
    it('should navigate to the edit page with stockOnly query param', () => {
      // Arrange
      const routerSpy = jest.spyOn(component['router'], 'navigate');
      const request = { ...mockProductListItem, id: 123 };

      // Act
      component.onModifyProductStock(request);

      // Assert
      expect(routerSpy).toHaveBeenCalledWith(['/productos/editar', 123], {
        queryParams: { stockOnly: true },
      });
    });
  });

  describe('columns.actions', () => {
    it('should call onModifyProductStock when "Ajustar stock" action is triggered', () => {
      // Arrange
      const spy = jest.spyOn(component, 'onModifyProductStock');
      const action = component.columns
        .find((c) => c.columnDef === 'actions')
        ?.actions?.find((a) => a.description === 'Ajustar stock');
      const request = mockProductListItem;

      // Act
      action?.action(request);

      // Assert
      expect(spy).toHaveBeenCalledWith(request);
    });
  });
});
