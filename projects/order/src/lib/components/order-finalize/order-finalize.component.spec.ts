import { CartService, Cart } from '@Cart';
import { AuthService } from '@Common';
import { OrderService } from '@Order';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { OrderFinalizeComponent } from './order-finalize.component';

describe('OrderFinalizeComponent', () => {
  let component: OrderFinalizeComponent;
  let fixture: ComponentFixture<OrderFinalizeComponent>;
  let cartServiceMock: jest.Mocked<CartService>;
  let orderServiceMock: jest.Mocked<OrderService>;
  let authServiceMock: jest.Mocked<AuthService>;
  let snackBarMock: jest.Mocked<MatSnackBar>;

  const mockCart: Cart = {
    cartId: '1',
    items: [
      {
        product: {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          price: 1000,
          category: { name: 'Test Category' },
          supplier: {
            businessName: 'Test Supplier',
            email: 'supplier@test.com',
            phone: '123456789',
          },
          stock: {
            quantityAvailable: 10,
            quantityOrdered: 0,
            quantityReserved: 0,
          },
          enabled: true,
          weight: 1,
          imageUrl: 'test.jpg',
        },
        quantity: 2,
      },
    ],
  };

  beforeEach(async () => {
    cartServiceMock = {
      getCart: jest.fn().mockReturnValue(of(mockCart)),
      deleteCart: jest.fn().mockReturnValue(of(undefined)),
      addProductToCart: jest.fn(),
      deleteCartProduct: jest.fn(),
    } as unknown as jest.Mocked<CartService>;

    orderServiceMock = {
      createOrder: jest.fn().mockReturnValue(of(undefined)),
    } as unknown as jest.Mocked<OrderService>;

    authServiceMock = {
      userId: 'user-1',
    } as unknown as jest.Mocked<AuthService>;

    snackBarMock = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [OrderFinalizeComponent, BrowserAnimationsModule],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: OrderService, useValue: orderServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderFinalizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should load cart and set isLoading to false', () => {
      // Arrange
      cartServiceMock.getCart.mockReturnValueOnce(of(mockCart));
      // Act
      component.ngOnInit();
      // Assert
      expect(component.cart).toEqual(mockCart);
      expect(component.isLoading).toBe(false);
    });

    it('should set isLoading to false on error', () => {
      // Arrange
      cartServiceMock.getCart.mockReturnValueOnce(
        throwError(() => new Error('error')),
      );
      // Act
      component.ngOnInit();
      // Assert
      expect(component.isLoading).toBe(false);
    });
  });

  describe('createOrder', () => {
    it('should not create order if cart is null', () => {
      // Arrange
      component.cart = null;
      // Act
      component.createOrder();
      // Assert
      expect(orderServiceMock.createOrder).not.toHaveBeenCalled();
    });

    it('should not create order if isSubmitting is true', () => {
      // Arrange
      component.cart = mockCart;
      component.isSubmitting = true;
      // Act
      component.createOrder();
      // Assert
      expect(orderServiceMock.createOrder).not.toHaveBeenCalled();
    });

    it('should set isSubmitting to false on order error', () => {
      // Arrange
      component.cart = mockCart;
      orderServiceMock.createOrder.mockReturnValueOnce(
        throwError(() => new Error('error')),
      );
      // Act
      component.createOrder();
      // Assert
      expect(component.isSubmitting).toBe(false);
    });
  });

  describe('cartTotal', () => {
    it('should return 0 if cart is null', () => {
      // Arrange
      component.cart = null;
      // Act
      const total = component.cartTotal;
      // Assert
      expect(total).toBe(0);
    });

    it('should return correct total if cart has items', () => {
      // Arrange
      component.cart = mockCart;
      // Act
      const total = component.cartTotal;
      // Assert
      expect(total).toBe(2000);
    });
  });

  describe('shippingCost', () => {
    it('should return 15000 if selectedShipping is domicilio', () => {
      // Arrange
      component.selectedShipping = 'domicilio';
      // Act
      const cost = component.shippingCost;
      // Assert
      expect(cost).toBe(15000);
    });

    it('should return 0 if selectedShipping is not domicilio', () => {
      // Arrange
      component.selectedShipping = 'sucursal';
      // Act
      const cost = component.shippingCost;
      // Assert
      expect(cost).toBe(0);
    });
  });

  describe('taxes', () => {
    it('should return 5% of cartTotal', () => {
      // Arrange
      component.cart = mockCart;
      // Act
      const taxes = component.taxes;
      // Assert
      expect(taxes).toBe(100);
    });
  });

  describe('finalTotal', () => {
    it('should return the sum of cartTotal, shippingCost, and taxes', () => {
      // Arrange
      component.cart = mockCart;
      component.selectedShipping = 'domicilio';
      // Act
      const total = component.finalTotal;
      // Assert
      expect(total).toBe(2000 + 15000 + 100);
    });
  });
});
