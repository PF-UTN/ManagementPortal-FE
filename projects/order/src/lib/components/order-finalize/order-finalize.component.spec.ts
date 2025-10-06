import { CartService, Cart } from '@Cart';
import { AuthService } from '@Common';
import { CheckoutService } from '@Common-UI';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { OrderFinalizeComponent } from './order-finalize.component';
import { OrderService } from '../../services/order.service';

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
      createOrder: jest.fn().mockReturnValue(of({ id: 52 })),
      getClient: jest.fn().mockReturnValue(
        of({
          id: 1,
          address: {
            street: 'Calle Falsa',
            streetNumber: 123,
            town: {
              name: 'Rosario',
              zipCode: '2000',
              province: {
                name: 'Santa Fe',
                country: { name: 'Argentina' },
              },
            },
          },
        }),
      ),
    } as unknown as jest.Mocked<OrderService>;

    authServiceMock = {
      userId: 'user-1',
    } as unknown as jest.Mocked<AuthService>;

    snackBarMock = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    const checkoutServiceMock = {
      createOrderCheckoutPreferences: jest.fn(),
    } as unknown as jest.Mocked<CheckoutService>;

    await TestBed.configureTestingModule({
      imports: [
        OrderFinalizeComponent,
        BrowserAnimationsModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: OrderService, useValue: orderServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: CheckoutService, useValue: checkoutServiceMock },
        provideHttpClientTesting(),
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
      expect(component.isLoading()).toBe(false);
    });

    it('should set isLoading to false on error', () => {
      // Arrange
      cartServiceMock.getCart.mockReturnValueOnce(
        throwError(() => new Error('error')),
      );
      // Act
      component.ngOnInit();
      // Assert
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('createOrder', () => {
    it('should not create order if cart is null', () => {
      // Arrange
      component.cart = null;
      // Act
      component.handleFinalizeClick();
      // Assert
      expect(orderServiceMock.createOrder).not.toHaveBeenCalled();
    });

    it('should not create order if isSubmitting is true', () => {
      // Arrange
      component.cart = mockCart;
      component.isSubmitting.set(true);
      // Act
      component.handleFinalizeClick();
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
      component.handleFinalizeClick();
      // Assert
      expect(component.isSubmitting()).toBe(false);
    });

    it('should set orderStatusId = 7 when payment is tarjeta', () => {
      // Arrange
      component.cart = mockCart;
      component.selectedPayment = 'tarjeta';
      component.selectedShipping = 'domicilio';
      // Act
      component.handleFinalizeClick();
      // Assert
      expect(orderServiceMock.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ orderStatusId: 7 }),
      );
    });

    it('should set orderStatusId = 2 when payment is entrega and shipping is sucursal', () => {
      // Arrange
      component.cart = mockCart;
      component.selectedPayment = 'entrega';
      component.selectedShipping = 'sucursal';
      // Act
      component.handleFinalizeClick();
      // Assert
      expect(orderServiceMock.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ orderStatusId: 2 }),
      );
    });

    it('should set orderStatusId = 1 for entrega and shipping domicilio', () => {
      // Arrange
      component.cart = mockCart;
      component.selectedPayment = 'entrega';
      component.selectedShipping = 'domicilio';
      // Act
      component.handleFinalizeClick();
      // Assert
      expect(orderServiceMock.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ orderStatusId: 1 }),
      );
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
    it('should return the sum of cartTotal and taxes', () => {
      // Arrange
      component.cart = mockCart;
      // Act
      // Assert
      expect(component.finalTotal).toBe(2000 + 100);
    });
  });
});
