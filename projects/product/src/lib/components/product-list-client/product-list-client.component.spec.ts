import { LateralDrawerService } from '@Common-UI';

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { of } from 'rxjs';

import { ProductListClientComponent } from './product-list-client.component';
import { ProductService } from '../../services/product.service';
import { mockProductListItem } from '../../testing/mock-data.model';
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
  });

  describe('Sorting', () => {
    it('should send orderBy param as price-asc', fakeAsync(() => {
      // Arrange
      const spy = jest.spyOn(productService, 'postSearchProduct');
      component.filterForm.get('sort')?.setValue('price-asc');
      const expectedOrderBy = { field: 'price', direction: 'asc' };

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expectedOrderBy,
        }),
      );
    }));

    it('should send orderBy param as name-desc', fakeAsync(() => {
      // Arrange
      const spy = jest.spyOn(productService, 'postSearchProduct');
      component.filterForm.get('sort')?.setValue('name-desc');
      const expectedOrderBy = { field: 'name', direction: 'desc' };

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expectedOrderBy,
        }),
      );
    }));

    it('should assign products as returned by backend', fakeAsync(() => {
      // Arrange
      const mockProducts = [
        { ...mockProductListItem, id: 1, name: 'B', price: 20 },
        { ...mockProductListItem, id: 2, name: 'A', price: 10 },
      ];
      productService.postSearchProduct.mockReturnValue(
        of({ results: mockProducts, total: 2 }),
      );

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(component.products).toEqual(mockProducts);
    }));
  });

  describe('Search', () => {
    it('should clear the searchText form control when clearSearch is called', () => {
      // Arrange
      component.filterForm.get('searchText')?.setValue('algo');

      // Act
      component.clearSearch();

      // Assert
      expect(component.filterForm.get('searchText')?.value).toBe('');
    });
  });

  describe('Quantity and Stock', () => {
    it('should not decrement below 1', () => {
      // Arrange
      component.products = mockProductListItems;
      component.quantities = { '1': 1 };

      // Act
      component.decreaseQuantity(1);

      // Assert
      expect(component.quantities['1']).toBe(1);
    });

    it('should handle quantity input and stock error', () => {
      // Arrange
      component.products = [{ ...mockProductListItem, id: 1, stock: 50 }];
      const event = { target: { value: '100' } } as unknown as Event;

      // Act
      component.onQuantityInput(1, event);

      // Assert
      expect(component.quantities['1']).toBe(50);
      expect(component.stockError['1']).toBe(false);
    });

    it('should set quantity to 1 if input is invalid', () => {
      // Arrange
      component.products = mockProductListItems;
      const event = { target: { value: '' } } as unknown as Event;

      // Act
      component.onQuantityInput(1, event);

      // Assert
      expect(component.quantities['1']).toBe(1);
    });

    it('should set stockError to true if quantity exceeds stock', () => {
      // Arrange
      component.products = [
        {
          id: 1,
          name: 'Test',
          stock: 2,
          weight: 1,
          price: 1,
          description: '',
          categoryName: 'Alimentos',
          supplierBusinessName: 'Proveedor',
          enabled: true,
        },
      ];
      component.quantities = { 1: 3 };

      // Act
      component['updateStockError'](1);

      // Assert
      expect(component.stockError[1]).toBe(true);
    });

    it('should set stockError to false if quantity does not exceed stock', () => {
      // Arrange
      component.products = [
        {
          id: 1,
          name: 'Test',
          stock: 2,
          weight: 1,
          price: 1,
          description: '',
          categoryName: 'Alimentos',
          supplierBusinessName: 'Proveedor',
          enabled: true,
        },
      ];
      component.quantities = { 1: 2 };

      // Act
      component['updateStockError'](1);

      // Assert
      expect(component.stockError[1]).toBe(false);
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

    it('should close the drawer when footer firstButton click is called', () => {
      // Arrange
      const closeSpy = jest.spyOn(lateralDrawerService, 'close');

      // Act
      component.openProductDrawer(1);
      const config = (lateralDrawerService.open as jest.Mock).mock.calls[0][2];
      config.footer.firstButton.click();

      // Assert
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('Quantity and Stock', () => {
    it('should initialize quantity to 1 and increment', () => {
      // Arrange
      component.products = [{ ...mockProductListItem, id: 1, stock: 5 }];
      component.quantities = {};

      // Act
      component.increaseQuantity(1);

      // Assert
      expect(component.quantities['1']).toBe(2);
      expect(component.stockError['1']).toBe(false);
    });

    it('should set stockError to true if increment exceeds stock', () => {
      // Arrange
      component.products = [{ ...mockProductListItem, id: 1, stock: 1 }];
      component.quantities = { '1': 1 };

      // Act
      component.increaseQuantity(1);

      // Assert
      expect(component.stockError['1']).toBe(true);
    });

    it('should set stockError to false if increment does not exceed stock', () => {
      // Arrange
      component.products = [{ ...mockProductListItem, id: 1, stock: 3 }];
      component.quantities = { '1': 2 };

      // Act
      component.increaseQuantity(1);

      // Assert
      expect(component.stockError['1']).toBe(false);
    });

    it('should initialize quantity to 1 and not decrement below 1', () => {
      // Arrange
      component.products = [{ ...mockProductListItem, id: 1, stock: 5 }];
      component.quantities = {};

      // Act
      component.decreaseQuantity(1);

      // Assert
      expect(component.quantities['1']).toBe(1);
    });

    it('should decrement quantity if greater than 1', () => {
      // Arrange
      component.products = [{ ...mockProductListItem, id: 1, stock: 5 }];
      component.quantities = { '1': 3 };

      // Act
      component.decreaseQuantity(1);

      // Assert
      expect(component.quantities['1']).toBe(2);
    });

    it('should set stockError correctly after decrement', () => {
      // Arrange
      component.products = [{ ...mockProductListItem, id: 1, stock: 1 }];
      component.quantities = { '1': 3 };

      // Act
      component.decreaseQuantity(1);

      // Assert
      expect(component.stockError['1']).toBe(true);

      // Act again
      component.decreaseQuantity(1);

      // Assert
      expect(component.stockError['1']).toBe(false);
    });

    it('should not allow opening product drawer if stock is 0 or quantity >= stock', () => {
      // Arrange
      const itemSinStock = { ...mockProductListItem, id: 1, stock: 0 };
      const itemConStock = { ...mockProductListItem, id: 2, stock: 5 };
      component.quantities = { 2: 5 };

      // Act & Assert
      expect(component.canOpenProductDrawer(itemSinStock)).toBe(false);
      expect(component.canOpenProductDrawer(itemConStock)).toBe(false);
      component.quantities = { 2: 3 };
      expect(component.canOpenProductDrawer(itemConStock)).toBe(true);
    });
  });
  describe('Keyboard events', () => {
    it('should call openProductDrawer with selectedProductId on Enter key', () => {
      // Arrange
      component.selectedProductId = 123;
      const spy = jest.spyOn(component, 'openProductDrawer');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      // Act
      component.onCardKeyDown(event);

      // Assert
      expect(spy).toHaveBeenCalledWith(123);
    });

    it('should not call openProductDrawer if selectedProductId is undefined', () => {
      // Arrange
      component.selectedProductId = undefined;
      const spy = jest.spyOn(component, 'openProductDrawer');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      // Act
      component.onCardKeyDown(event);

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call openProductDrawer on other keys', () => {
      // Arrange
      component.selectedProductId = 123;
      const spy = jest.spyOn(component, 'openProductDrawer');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      // Act
      component.onCardKeyDown(event);

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
