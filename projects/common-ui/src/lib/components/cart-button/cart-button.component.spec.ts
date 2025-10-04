import { mockCart } from '@Cart';
import { CartService, AuthService } from '@Common';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { CartButtonComponent } from './cart-button.component';

describe('CartButtonComponent', () => {
  let component: CartButtonComponent;
  let fixture: ComponentFixture<CartButtonComponent>;
  let cartService: CartService;
  let router: Router;

  beforeEach(async () => {
    cartService = mockDeep<CartService>();
    cartService.getCart = jest.fn().mockReturnValue(of(mockCart));
    cartService.cart$ = of(mockCart);

    await TestBed.configureTestingModule({
      imports: [CartButtonComponent],
      providers: [
        { provide: CartService, useValue: cartService },
        { provide: AuthService, useValue: mockDeep<AuthService>() },
        { provide: Router, useValue: mockDeep<Router>() },
      ],
    }).compileComponents();

    cartService = TestBed.inject(CartService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(CartButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getCart on ngOnInit', () => {
    // Arrange
    const spy = jest.spyOn(cartService, 'getCart');
    // Act
    component.ngOnInit();
    // Assert
    expect(spy).toHaveBeenCalled();
  });

  it('should update count when cart$ emits', () => {
    // Arrange
    // Act
    // Assert
    expect(component.count).toBe(1);
  });

  it('should unsubscribe on destroy', () => {
    // Arrange
    const unsubscribeSpy = jest.spyOn(component['cartSub']!, 'unsubscribe');
    // Act
    component.ngOnDestroy();
    // Assert
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should call router.navigate on goToCart', () => {
    // Arrange
    const spy = jest.spyOn(router, 'navigate');
    // Act
    component.goToCart();
    // Assert
    expect(spy).toHaveBeenCalledWith(['/carrito']);
  });
});
