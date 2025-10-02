import { CartService, mockCartItem } from '@Cart';

import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { CartBadgeButtonComponent } from './cart-badge-button.component';

describe('CartBadgeButtonComponent', () => {
  let component: CartBadgeButtonComponent;
  let cartService: CartService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartBadgeButtonComponent, NoopAnimationsModule],
      providers: [
        { provide: CartService, useValue: mockDeep<CartService>() },
        { provide: Router, useValue: mockDeep<Router>() },
      ],
    }).compileComponents();

    cartService = TestBed.inject(CartService);
    router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(CartBadgeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Arrange: (setup done in beforeEach)
    // Act: (component is created)
    // Assert:
    expect(component).toBeTruthy();
  });

  it('should subscribe to cart$ and update count', () => {
    // Arrange
    const mockCart = { cartId: 'cart:1', items: [mockCartItem] };
    jest.spyOn(cartService, 'cart$', 'get').mockReturnValue(of(mockCart));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.count).toBe(3);
  });

  it('should navigate to /carrito on goToCart', () => {
    // Arrange
    const navigateSpy = jest
      .spyOn(router, 'navigate')
      .mockImplementation(() => Promise.resolve(true));

    // Act
    component.goToCart();

    // Assert
    expect(navigateSpy).toHaveBeenCalledWith(['/carrito']);
  });

  it('should unsubscribe on ngOnDestroy', () => {
    // Arrange
    const unsubscribeSpy = jest
      .spyOn(component['cartSub']!, 'unsubscribe')
      .mockImplementation(() => {});

    // Act
    component.ngOnDestroy();

    // Assert
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
