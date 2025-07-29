import { TestBed } from '@angular/core/testing';
import { mockDeep, MockProxy } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { DetailLateralClientDrawerComponent } from './detail-lateral-client-drawer.component';
import { ProductDetail } from '../../models/product-detail.model';
import { ProductService } from '../../services/product.service';

describe('DetailLateralClientDrawerComponent', () => {
  let component: DetailLateralClientDrawerComponent;
  let productServiceMock: MockProxy<ProductService>;

  const mockProduct: ProductDetail = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    weight: 2,
    stock: {
      quantityAvailable: 5,
      quantityOrdered: 0,
      quantityReserved: 0,
    },
    category: {
      name: 'Test Category',
    },
    supplier: {
      businessName: 'Test Supplier',
      email: 'supplier@test.com',
      phone: '123456789',
    },
    enabled: true,
  };

  beforeEach(async () => {
    productServiceMock = mockDeep<ProductService>();

    await TestBed.configureTestingModule({
      imports: [DetailLateralClientDrawerComponent],
      providers: [
        {
          provide: ProductService,
          useValue: productServiceMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DetailLateralClientDrawerComponent);
    component = fixture.componentInstance;
    // Usar productServiceMock directamente, no TestBed.inject
  });

  describe('ngOnInit', () => {
    test('should fetch product and set data', () => {
      // Arrange
      component.productId = 1;
      productServiceMock.getProductById.mockReturnValue(of(mockProduct));

      // Act
      component.ngOnInit();

      // Assert
      expect(component.data()).toEqual(mockProduct);
      expect(component.isLoading()).toBe(false);
    });

    test('should set error if product fetch fails', () => {
      // Arrange
      component.productId = 1;
      productServiceMock.getProductById.mockReturnValue(
        throwError(() => new Error('error')),
      );

      // Act
      component.ngOnInit();

      // Assert
      expect(component.error()).toBe(
        'No se pudo obtener el detalle del producto.',
      );
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('increaseQuantity', () => {
    test('should increase quantity if less than available', () => {
      // Arrange
      component.data.set(mockProduct);
      component.quantity = 2;

      // Act
      component.increaseQuantity();

      // Assert
      expect(component.quantity).toBe(3);
    });

    test('should not increase quantity if at max available', () => {
      // Arrange
      component.data.set(mockProduct);
      component.quantity = mockProduct.stock.quantityAvailable;

      // Act
      component.increaseQuantity();

      // Assert
      expect(component.quantity).toBe(mockProduct.stock.quantityAvailable);
    });
  });

  describe('decreaseQuantity', () => {
    test('should decrease quantity if greater than 1', () => {
      // Arrange
      component.quantity = 3;

      // Act
      component.decreaseQuantity();

      // Assert
      expect(component.quantity).toBe(2);
    });

    test('should not decrease quantity below 1', () => {
      // Arrange
      component.quantity = 1;

      // Act
      component.decreaseQuantity();

      // Assert
      expect(component.quantity).toBe(1);
    });
  });

  describe('onQuantityInput', () => {
    beforeEach(() => {
      component.data.set(mockProduct);
    });

    test('should set quantity to input value within bounds', () => {
      // Arrange
      const input = document.createElement('input');
      input.value = '4';
      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: input });

      // Act
      component.onQuantityInput(event);

      // Assert
      expect(component.quantity).toBe(4);
    });

    test('should set quantity to 1 if input value is less than 1', () => {
      // Arrange
      const input = document.createElement('input');
      input.value = '0';
      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: input });

      // Act
      component.onQuantityInput(event);

      // Assert
      expect(component.quantity).toBe(1);
    });

    test('should set quantity to max available if input value is greater than available', () => {
      // Arrange
      const input = document.createElement('input');
      input.value = '10';
      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: input });

      // Act
      component.onQuantityInput(event);

      // Assert
      expect(component.quantity).toBe(mockProduct.stock.quantityAvailable);
    });
  });
});
