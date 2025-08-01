import { LateralDrawerService } from '@Common-UI';

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProductListClientComponent } from './product-list-client.component';
import { ProductService } from '../../services/product.service';
import { mockProductListItem } from '../../testing/mock-data.model';
import {
  mockProductListItems,
  mockProductCategories,
} from '../../testing/mock-data.model';
import { DetailLateralClientDrawerComponent } from '../detail-lateral-client-drawer/detail-lateral-client-drawer.component';

describe('ProductListClientComponent', () => {
  let component: ProductListClientComponent;
  let fixture: ComponentFixture<ProductListClientComponent>;
  let productService: jest.Mocked<ProductService>;
  let lateralDrawerService: jest.Mocked<LateralDrawerService>;

  beforeEach(async () => {
    productService = {
      getCategories: jest.fn().mockReturnValue(of(mockProductCategories)),
      postSearchProduct: jest
        .fn()
        .mockReturnValue(of({ results: [], total: 0 })),
      createProduct: jest.fn(),
      getProductById: jest.fn(),
    } as unknown as jest.Mocked<ProductService>;

    lateralDrawerService = {
      open: jest.fn(),
      close: jest.fn(),
      setDrawer: jest.fn(),
      updateConfig: jest.fn(),
      config: {} as Record<string, unknown>,
    } as unknown as jest.Mocked<LateralDrawerService>;

    await TestBed.configureTestingModule({
      imports: [ProductListClientComponent],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: LateralDrawerService, useValue: lateralDrawerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListClientComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should fetch categories and products on init', fakeAsync(() => {
      productService.getCategories.mockReturnValue(of(mockProductCategories));
      productService.postSearchProduct.mockReturnValue(
        of({
          results: mockProductListItems,
          total: mockProductListItems.length,
        }),
      );
      component.ngOnInit();
      tick(500);
      expect(component.categories).toEqual(mockProductCategories);
      expect(component.products).toEqual(mockProductListItems);
      expect(component.isLoading).toBeFalsy();
    }));

    it('should set isLoading to false and return empty results on error', fakeAsync(() => {
      productService.postSearchProduct.mockReturnValueOnce(
        throwError(() => new Error('fail')),
      );
      component.ngOnInit();
      component.filterForm.get('searchText')?.setValue('error');
      tick(500);
      expect(component.products).toEqual([]);
      expect(component.isLoading).toBe(false);
    }));
  });

  describe('Sorting', () => {
    it('should send orderBy param as price-asc', fakeAsync(() => {
      const spy = jest.spyOn(productService, 'postSearchProduct');
      component.filterForm.get('sort')?.setValue('price-asc');
      const expectedOrderBy = { field: 'price', direction: 'asc' };
      component.ngOnInit();
      tick();
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expectedOrderBy,
        }),
      );
    }));

    it('should send orderBy param as name-desc', fakeAsync(() => {
      const spy = jest.spyOn(productService, 'postSearchProduct');
      component.filterForm.get('sort')?.setValue('name-desc');
      const expectedOrderBy = { field: 'name', direction: 'desc' };
      component.ngOnInit();
      tick();
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expectedOrderBy,
        }),
      );
    }));

    it('should assign products as returned by backend', fakeAsync(() => {
      const mockProducts = [
        { ...mockProductListItem, id: 1, name: 'B', price: 20 },
        { ...mockProductListItem, id: 2, name: 'A', price: 10 },
      ];
      productService.postSearchProduct.mockReturnValue(
        of({ results: mockProducts, total: 2 }),
      );
      component.ngOnInit();
      tick();
      expect(component.products).toEqual(mockProducts);
    }));
  });

  describe('Search', () => {
    it('should clear the searchText form control when clearSearch is called', () => {
      component.filterForm.get('searchText')?.setValue('algo');
      component.clearSearch();
      expect(component.filterForm.get('searchText')?.value).toBe('');
    });
  });

  describe('Drawer', () => {
    it('should open product drawer with correct quantity', () => {
      component.products = [
        {
          id: 1,
          stock: 2,
          name: 'Test',
          price: 10,
          weight: 1,
          description: '',
          categoryName: '',
          supplierBusinessName: '',
          enabled: true,
        },
      ];

      component.openProductDrawer({ productId: 1, quantity: 2 });

      expect(lateralDrawerService.open).toHaveBeenCalledWith(
        DetailLateralClientDrawerComponent,
        { productId: 1, quantity: 2 },
        expect.objectContaining({
          title: 'Detalle del Producto',
          footer: expect.objectContaining({
            firstButton: expect.objectContaining({
              text: 'Agregar al carrito',
              disabled: false,
              click: expect.any(Function),
            }),
            secondButton: expect.objectContaining({
              text: 'Cancelar',
              click: expect.any(Function),
            }),
          }),
        }),
      );
    });

    it('should close the drawer when footer firstButton click is called', () => {
      const closeSpy = jest.spyOn(lateralDrawerService, 'close');
      component.products = [
        {
          id: 1,
          stock: 2,
          name: 'Test',
          price: 10,
          weight: 1,
          description: '',
          categoryName: '',
          supplierBusinessName: '',
          enabled: true,
        },
      ];

      component.openProductDrawer({ productId: 1, quantity: 2 });
      const config = (lateralDrawerService.open as jest.Mock).mock.calls[0][2];
      config.footer.firstButton.click();
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('Keyboard events', () => {
    it('should call openProductDrawer with selectedProductId and quantity 1 on Enter key', () => {
      component.selectedProductId = 123;
      const spy = jest.spyOn(component, 'openProductDrawer');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onCardKeyDown(event);
      expect(spy).toHaveBeenCalledWith({ productId: 123, quantity: 1 });
    });

    it('should not call openProductDrawer if selectedProductId is undefined', () => {
      component.selectedProductId = undefined;
      const spy = jest.spyOn(component, 'openProductDrawer');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onCardKeyDown(event);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call openProductDrawer on other keys', () => {
      component.selectedProductId = 123;
      const spy = jest.spyOn(component, 'openProductDrawer');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.onCardKeyDown(event);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
