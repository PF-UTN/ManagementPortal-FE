import { mockCart } from '@Cart';
import { CartService } from '@Common';
import { LateralDrawerService } from '@Common-UI';

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep, MockProxy } from 'jest-mock-extended';
import { delay, of, throwError } from 'rxjs';

import { DetailLateralClientDrawerComponent } from './detail-lateral-client-drawer.component';
import { ProductDetail } from '../../models/product-detail.model';
import { ProductService } from '../../services/product.service';

describe('DetailLateralClientDrawerComponent', () => {
  let component: DetailLateralClientDrawerComponent;
  let productServiceMock: MockProxy<ProductService>;
  let cartService: CartService;

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
    imageUrl: null,
  };

  beforeEach(async () => {
    productServiceMock = mockDeep<ProductService>();

    await TestBed.configureTestingModule({
      imports: [DetailLateralClientDrawerComponent, NoopAnimationsModule],
      providers: [
        {
          provide: ProductService,
          useValue: productServiceMock,
        },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
        {
          provide: CartService,
          useValue: mockDeep<CartService>(),
        },
      ],
    }).compileComponents();

    cartService = TestBed.inject(CartService);
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
  describe('confirmAddToCart', () => {
    it('should adjust quantity to max stock and show stock message if total exceeds available', (done) => {
      // Arrange
      component.data.set(mockProduct);
      component.productId = 1;
      component.quantity = 4;

      jest.spyOn(cartService, 'getCart').mockReturnValue(of(mockCart));
      const addProductSpy = jest
        .spyOn(cartService, 'addProductToCart')
        .mockReturnValue(of(mockCart));

      // Act
      component.confirmAddToCart();

      // Assert
      setTimeout(() => {
        expect(addProductSpy).toHaveBeenCalledWith({
          productId: 1,
          quantity: 5,
        });
        done();
      }, 0);
    });

    it('should add product and show success message if within stock', (done) => {
      // Arrange
      component.data.set(mockProduct);
      component.productId = 1;
      component.quantity = 2;

      jest.spyOn(cartService, 'getCart').mockReturnValue(of(mockCart));
      const addProductSpy = jest
        .spyOn(cartService, 'addProductToCart')
        .mockReturnValue(of(mockCart));

      // Act
      component.confirmAddToCart();

      // Assert
      setTimeout(() => {
        expect(addProductSpy).toHaveBeenCalledWith({
          productId: 1,
          quantity: 4,
        });
        done();
      }, 0);
    });

    it('should call closeDrawer after successful addProductToCart', (done) => {
      // Arrange
      component.data.set(mockProduct);
      component.productId = 1;
      component.quantity = 2;

      jest.spyOn(cartService, 'getCart').mockReturnValue(of(mockCart));
      jest.spyOn(cartService, 'addProductToCart').mockReturnValue(of(mockCart));
      const closeSpy = jest
        .spyOn(component, 'closeDrawer')
        .mockImplementation(() => {});

      // Act
      component.confirmAddToCart();

      // Assert
      setTimeout(() => {
        expect(closeSpy).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should set isLoading true while adding and false after', fakeAsync(() => {
      // Arrange
      component.data.set(mockProduct);
      component.productId = 1;
      component.quantity = 2;

      jest.spyOn(cartService, 'getCart').mockReturnValue(of(mockCart));
      jest
        .spyOn(cartService, 'addProductToCart')
        .mockReturnValue(of(mockCart).pipe(delay(100)));

      // Act
      component.confirmAddToCart();

      // Assert
      expect(component.isLoading()).toBe(true);
      tick(100);
      expect(component.isLoading()).toBe(false);
    }));
    it('should not call addProductToCart if product is not loaded', () => {
      // Arrange
      component.data.set(undefined as unknown as ProductDetail);
      component.productId = 1;
      component.quantity = 2;

      const addProductSpy = jest.spyOn(cartService, 'addProductToCart');

      // Act
      component.confirmAddToCart();

      // Assert
      expect(addProductSpy).not.toHaveBeenCalled();
    });
  });
});
