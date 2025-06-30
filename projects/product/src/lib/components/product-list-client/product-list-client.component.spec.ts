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
import {
  mockProductListItems,
  mockProductCategories,
} from '../../testing/mock-data.model';
import { DetailLateralDrawerComponent } from '../detail-lateral-drawer/detail-lateral-drawer.component';

describe('ProductListClientComponent', () => {
  let component: ProductListClientComponent;
  let fixture: ComponentFixture<ProductListClientComponent>;
  let productService: jest.Mocked<ProductService>;
  let lateralDrawerService: jest.Mocked<LateralDrawerService>;

  beforeEach(async () => {
    productService = {
      getCategories: jest.fn(),
      postSearchProduct: jest.fn(),
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
      // Assert
      expect(component).toBeTruthy();
    });

    it('should fetch categories and products on init', fakeAsync(() => {
      // Arrange
      productService.getCategories.mockReturnValue(of(mockProductCategories));
      productService.postSearchProduct.mockReturnValue(
        of({
          results: mockProductListItems,
          total: mockProductListItems.length,
        }),
      );

      // Act
      component.ngOnInit();
      tick(500);

      // Assert
      expect(component.categories).toEqual(mockProductCategories);
      expect(component.products).toEqual(mockProductListItems);
      expect(component.isLoading).toBeFalsy();
    }));

    it('should handle error on fetchProducts', fakeAsync(() => {
      // Arrange
      productService.getCategories.mockReturnValue(of(mockProductCategories));
      productService.postSearchProduct.mockReturnValue(
        throwError(() => new Error('error')),
      );

      // Act
      component.ngOnInit();
      tick(500);

      // Assert
      expect(component.isLoading).toBeFalsy();
    }));
  });

  describe('Sorting', () => {
    it('should sort products by price ascending', fakeAsync(() => {
      // Arrange
      productService.getCategories.mockReturnValue(of(mockProductCategories));
      productService.postSearchProduct.mockReturnValue(
        of({
          results: mockProductListItems,
          total: mockProductListItems.length,
        }),
      );

      // Act
      component.sort = 'price-asc';
      component.ngOnInit();
      tick(500);

      // Assert
      expect(component.products[0].price).toBeLessThanOrEqual(
        component.products[1].price,
      );
    }));

    it('should sort products by price descending', fakeAsync(() => {
      // Arrange
      productService.getCategories.mockReturnValue(of(mockProductCategories));
      productService.postSearchProduct.mockReturnValue(
        of({
          results: mockProductListItems,
          total: mockProductListItems.length,
        }),
      );

      // Act
      component.sort = 'price-desc';
      component.ngOnInit();
      tick(500);

      // Assert
      expect(component.products[0].price).toBeGreaterThanOrEqual(
        component.products[1].price,
      );
    }));

    it('should sort products by name ascending', fakeAsync(() => {
      // Arrange
      productService.getCategories.mockReturnValue(of(mockProductCategories));
      productService.postSearchProduct.mockReturnValue(
        of({
          results: mockProductListItems,
          total: mockProductListItems.length,
        }),
      );

      // Act
      component.sort = 'name-asc';
      component.ngOnInit();
      tick(500);

      // Assert
      expect(
        component.products[0].name.localeCompare(component.products[1].name),
      ).toBeLessThanOrEqual(0);
    }));

    it('should sort products by name descending', fakeAsync(() => {
      // Arrange
      productService.getCategories.mockReturnValue(of(mockProductCategories));
      productService.postSearchProduct.mockReturnValue(
        of({
          results: mockProductListItems,
          total: mockProductListItems.length,
        }),
      );

      // Act
      component.sort = 'name-desc';
      component.ngOnInit();
      tick(500);

      // Assert
      expect(
        component.products[0].name.localeCompare(component.products[1].name),
      ).toBeGreaterThanOrEqual(0);
    }));
  });

  describe('Search', () => {
    it('should update searchText and fetch products on search', fakeAsync(() => {
      // Arrange
      productService.getCategories.mockReturnValue(of(mockProductCategories));
      productService.postSearchProduct.mockReturnValue(
        of({
          results: mockProductListItems,
          total: mockProductListItems.length,
        }),
      );

      // Act
      component.ngOnInit();
      component.onSearchChange('test');
      tick(500);

      // Assert
      expect(component.searchText).toBe('test');
      expect(productService.postSearchProduct).toHaveBeenCalled();
    }));

    it('should update searchText on input change', () => {
      // Arrange
      const event = { target: { value: 'nuevo' } } as unknown as Event;
      const spy = jest.spyOn(component, 'onSearchChange');

      // Act
      component.onInputChange(event);

      // Assert
      expect(spy).toHaveBeenCalledWith('nuevo');
    });

    it('should clear search', () => {
      // Arrange
      component.searchText = 'algo';
      const spy = jest.spyOn(component, 'onSearchChange');

      // Act
      component.clearSearch();

      // Assert
      expect(component.searchText).toBe('');
      expect(spy).toHaveBeenCalledWith('');
    });
  });

  describe('Quantity and Stock', () => {
    it('should not decrement below 1', () => {
      // Arrange
      component.products = mockProductListItems;
      component.quantities = { '1': 1 };

      // Act
      component.decrement('1');

      // Assert
      expect(component.quantities['1']).toBe(1);
    });

    it('should handle quantity input and stock error', () => {
      // Arrange
      component.products = mockProductListItems;
      const event = { target: { value: '100' } } as unknown as Event;

      // Act
      component.onQuantityInput('1', event);

      // Assert
      expect(component.quantities['1']).toBe(100);
      expect(component.stockError['1']).toBeTruthy();
    });

    it('should set quantity to 1 if input is invalid', () => {
      // Arrange
      component.products = mockProductListItems;
      const event = { target: { value: '' } } as unknown as Event;

      // Act
      component.onQuantityInput('1', event);

      // Assert
      expect(component.quantities['1']).toBe(1);
    });
  });

  describe('Drawer', () => {
    it('should open product drawer', () => {
      // Act
      component.openProductDrawer(1);

      // Assert
      expect(lateralDrawerService.open).toHaveBeenCalledWith(
        DetailLateralDrawerComponent,
        { productId: 1 },
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
});
