import { CartService } from '@Common';
import { LateralDrawerService } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import {
  mockCartItem,
  mockEmptyCart,
} from './../../../lib/testing/mock-data.model';
import { CartDetailComponent } from './cart-detail.component';

describe('CartDetailComponent', () => {
  let component: CartDetailComponent;
  let fixture: ComponentFixture<CartDetailComponent>;
  let cartService: CartService;
  let lateralDrawerService: LateralDrawerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartDetailComponent, CommonModule, NoopAnimationsModule],
      providers: [
        {
          provide: CartService,
          useValue: mockDeep<CartService>(),
        },
        {
          provide: LateralDrawerService,
          useValue: {
            open: jest.fn().mockReturnValue(of(void 0)),
            close: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    cartService = TestBed.inject(CartService);
    lateralDrawerService = TestBed.inject(LateralDrawerService);
    jest.spyOn(cartService, 'getCart').mockReturnValue(of(mockEmptyCart));

    fixture = TestBed.createComponent(CartDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  describe('removeItem', () => {
    it('should remove item locally', () => {
      // Arrange
      const mockItem = mockCartItem;
      const mockCart = { cartId: 'cart:1', items: [mockItem] };
      component.data.set(mockCart);
      jest
        .spyOn(cartService, 'deleteCartProduct')
        .mockReturnValue(of(mockCart));

      // Act
      component.removeItem(mockItem);

      // Assert
      expect(component.data()?.items.length).toBe(0);
    });

    it('should call deleteCartProduct service with correct params', () => {
      // Arrange
      const mockItem = mockCartItem;
      const mockCart = { cartId: 'cart:1', items: [mockItem] };
      component.data.set(mockCart);
      const spy = jest
        .spyOn(cartService, 'deleteCartProduct')
        .mockReturnValue(of(mockCart));

      // Act
      component.removeItem(mockItem);

      // Assert
      expect(spy).toHaveBeenCalledWith({ productId: 1 });
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity locally', () => {
      // Arrange
      const mockItem = mockCartItem;
      const mockCart = { cartId: 'cart:1', items: [mockItem] };
      component.data.set(mockCart);
      jest.spyOn(cartService, 'addProductToCart').mockReturnValue(of(mockCart));

      // Act
      component.updateQuantity(mockItem, 5);

      // Assert
      expect(component.data()?.items[0].quantity).toBe(5);
    });

    it('should call addProductToCart service with correct params', () => {
      // Arrange
      const mockItem = mockCartItem;
      const mockCart = { cartId: 'cart:1', items: [mockItem] };
      component.data.set(mockCart);
      const spy = jest
        .spyOn(cartService, 'addProductToCart')
        .mockReturnValue(of(mockCart));

      // Act
      component.updateQuantity(mockItem, 5);

      // Assert
      expect(spy).toHaveBeenCalledWith({ productId: 1, quantity: 5 });
    });
  });
  describe('emitQuantityChange', () => {
    it('should update item quantity locally', () => {
      // Arrange
      const mockItem = { ...mockCartItem, quantity: 2 };
      const mockCart = { cartId: 'cart:1', items: [mockItem] };
      component.data.set(mockCart);
      jest.spyOn(component, 'updateQuantity').mockImplementation(() => {});

      // Act
      component.emitQuantityChange(mockItem, 4);

      // Assert
      expect(component.data()?.items[0].quantity).toBe(4);
    });

    it('should call updateQuantity after debounce', (done) => {
      // Arrange
      const mockItem = { ...mockCartItem, quantity: 2 };
      const mockCart = { cartId: 'cart:1', items: [mockItem] };
      component.data.set(mockCart);
      const spy = jest
        .spyOn(component, 'updateQuantity')
        .mockImplementation(() => {});

      // Act
      component.emitQuantityChange(mockItem, 4);

      // Assert
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(mockItem, 4);
        done();
      }, 600);
    });
  });
  describe('emitQuantityChangeInput', () => {
    it('should update item quantity locally after debounce', (done) => {
      // Arrange
      const mockCart = { cartId: 'cart:1', items: [mockCartItem] };
      component.data.set(mockCart);
      jest.spyOn(component, 'updateQuantity').mockImplementation(() => {});

      // Act
      component.emitQuantityChangeInput(mockCartItem, 2);

      // Assert
      setTimeout(() => {
        expect(component.data()?.items[0].quantity).toBe(2);
        done();
      }, 1700);
    });

    it('should call updateQuantity after debounce', (done) => {
      // Arrange
      const mockCart = { cartId: 'cart:1', items: [mockCartItem] };
      component.data.set(mockCart);
      const spy = jest
        .spyOn(component, 'updateQuantity')
        .mockImplementation(() => {});

      // Act
      component.emitQuantityChangeInput(mockCartItem, 2);

      // Assert
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(mockCartItem, 2);
        done();
      }, 1700);
    });
  });
  describe('increaseQuantity', () => {
    it('should call emitQuantityChangeInstant if quantity < stock', () => {
      // Arrange
      const mockItem = {
        ...mockCartItem,
        quantity: 2,
        product: {
          ...mockCartItem.product,
          stock: {
            quantityAvailable: 5,
            quantityOrdered: 0,
            quantityReserved: 0,
          },
        },
      };
      const spy = jest
        .spyOn(component, 'emitQuantityChange')
        .mockImplementation(() => {});

      // Act
      component.increaseQuantity(mockItem);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockItem, 3);
    });
  });

  describe('decreaseQuantity', () => {
    it('should call emitQuantityChangeInstant if quantity > 1', () => {
      // Arrange
      const mockItem = { ...mockCartItem, quantity: 2 };
      const spy = jest
        .spyOn(component, 'emitQuantityChange')
        .mockImplementation(() => {});

      // Act
      component.decreaseQuantity(mockItem);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockItem, 1);
    });
  });
  describe('onQuantityInput', () => {
    const mockItem = {
      ...mockCartItem,
      quantity: 2,
      product: {
        ...mockCartItem.product,
        stock: {
          quantityAvailable: 10,
          quantityOrdered: 5,
          quantityReserved: 2,
        },
      },
    };
    it('should not update quantity if input is empty', () => {
      // Arrange
      const event = { target: { value: '' } } as unknown as Event;
      const spy = jest
        .spyOn(component, 'emitQuantityChangeInput')
        .mockImplementation(() => {});

      // Act
      component.onQuantityInput(mockItem, event);

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not update quantity if input is negative', () => {
      // Arrange
      const event = { target: { value: '-5' } } as unknown as Event;
      const spy = jest
        .spyOn(component, 'emitQuantityChangeInput')
        .mockImplementation(() => {});

      // Act
      component.onQuantityInput(mockCartItem, event);

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should update quantity if input is valid and within stock', () => {
      // Arrange
      const mockItem = { ...mockCartItem, quantity: 2 };
      const event = { target: { value: '5' } } as unknown as Event;
      const spy = jest
        .spyOn(component, 'emitQuantityChangeInput')
        .mockImplementation(() => {});

      // Act
      component.onQuantityInput(mockCartItem, event);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockItem, 5);
    });

    it('should correct quantity if input exceeds stock', () => {
      // Arrange
      const event = { target: { value: '15' } } as unknown as Event;
      const spy = jest
        .spyOn(component, 'emitQuantityChangeInput')
        .mockImplementation(() => {});

      // Act
      component.onQuantityInput(mockCartItem, event);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockItem, 10);
    });

    it('should set value to maxStock if input is greater than stock', () => {
      // Arrange
      const mockItem = {
        ...mockCartItem,
        quantity: 2,
        product: {
          ...mockCartItem.product,
          stock: {
            quantityAvailable: 5,
            quantityOrdered: 5,
            quantityReserved: 2,
          },
        },
      };
      const mockCart = { cartId: 'cart:1', items: [mockItem] };
      component.data.set(mockCart);
      const event = { target: { value: '10' } } as unknown as Event;
      const spy = jest
        .spyOn(component, 'emitQuantityChangeInput')
        .mockImplementation(() => {});

      // Act
      component.onQuantityInput(mockItem, event);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockItem, 5);
    });

    it('should call emitQuantityChangeInput with valid value', () => {
      // Arrange
      const mockItem = {
        ...mockCartItem,
        quantity: 2,
        product: {
          ...mockCartItem.product,
          stock: {
            quantityAvailable: 10,
            quantityOrdered: 5,
            quantityReserved: 2,
          },
        },
      };
      const mockCart = { cartId: 'cart:1', items: [mockItem] };
      component.data.set(mockCart);
      const event = { target: { value: '3' } } as unknown as Event;
      const spy = jest
        .spyOn(component, 'emitQuantityChangeInput')
        .mockImplementation(() => {});

      // Act
      component.onQuantityInput(mockItem, event);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockItem, 3);
    });
  });

  describe('openProductDrawer', () => {
    it('should call lateralDrawerService.open with correct arguments', () => {
      // Arrange
      const openSpy = jest.spyOn(lateralDrawerService, 'open');

      // Act
      component.openProductDrawer(10, 2);

      // Assert
      expect(openSpy).toHaveBeenCalledWith(
        expect.any(Function),
        { productId: 10, quantity: 2 },
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

    it('should call openProductDrawer when Enter or Space is pressed on cart item', () => {
      // Arrange
      const mockItem = mockCartItem;
      const spy = jest
        .spyOn(component, 'openProductDrawer')
        .mockImplementation(() => {});

      // Act
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onCartItemKeyDown(enterEvent, mockItem);

      // Assert
      expect(spy).toHaveBeenCalledWith(1, 2);
    });

    it('should NOT call openProductDrawer for other keys', () => {
      // Arrange
      const mockItem = mockCartItem;
      const spy = jest
        .spyOn(component, 'openProductDrawer')
        .mockImplementation(() => {});

      // Act
      const otherEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      component.onCartItemKeyDown(otherEvent, mockItem);

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });
  });
  describe('onQuantityBlur', () => {
    it('should correct quantity to 1 if input is empty on blur', () => {
      // Arrange
      const event = { target: { value: '' } } as unknown as Event;
      const spy = jest
        .spyOn(component, 'emitQuantityChangeInput')
        .mockImplementation(() => {});

      // Act
      component.onQuantityBlur(mockCartItem, event);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockCartItem, 1);
    });

    it('should correct quantity to 1 if input is negative on blur', () => {
      // Arrange
      const event = { target: { value: '-8' } } as unknown as Event;
      const spy = jest
        .spyOn(component, 'emitQuantityChangeInput')
        .mockImplementation(() => {});

      // Act
      component.onQuantityBlur(mockCartItem, event);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockCartItem, 1);
    });

    it('should not correct quantity if input is valid on blur', () => {
      // Arrange
      const event = { target: { value: '5' } } as unknown as Event;
      const spy = jest
        .spyOn(component, 'emitQuantityChangeInput')
        .mockImplementation(() => {});

      // Act
      component.onQuantityBlur(mockCartItem, event);

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('goToCheckout', () => {
    it('should navigate to /pedidos/finalizar when called', () => {
      // Arrange
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate');

      // Act
      component.goToCheckout();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['/pedidos/finalizar']);
    });
  });
});
