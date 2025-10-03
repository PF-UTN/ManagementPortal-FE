import { CartService } from '@Cart';
import { AuthService } from '@Common';

import { TestBed } from '@angular/core/testing';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { NavBarHorizontalComponent } from './nav-bar-horizontal.component';

describe('NavBarHorizontalComponent', () => {
  let component: NavBarHorizontalComponent;
  let cartService: CartService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBarHorizontalComponent],
      providers: [
        {
          provide: CartService,
          useValue: Object.assign(mockDeep<CartService>(), {
            getCart: jest
              .fn()
              .mockReturnValue(of({ cartId: 'test', items: [] })),
            cart$: of({ cartId: 'test', items: [] }),
          }),
        },
        {
          provide: AuthService,
          useValue: Object.assign(mockDeep<AuthService>(), {
            hasAccess: jest.fn().mockReturnValue(true),
          }),
        },
      ],
    }).compileComponents();

    cartService = TestBed.inject(CartService);
    authService = TestBed.inject(AuthService);
    const fixture = TestBed.createComponent(NavBarHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Assert
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

  it('should call hasAccess for shouldRender', () => {
    // Arrange
    const spy = jest.spyOn(authService, 'hasAccess');
    // Act
    // Assert
    expect(spy).toHaveBeenCalled();
  });

  it('should render navbar if hasAccess returns true', () => {
    // Arrange
    jest.spyOn(authService, 'hasAccess').mockReturnValue(true);
    // Act
    const result = component.shouldRender;
    // Assert
    expect(result).toBe(true);
  });

  it('should not render navbar if hasAccess returns false', () => {
    // Arrange
    jest.spyOn(authService, 'hasAccess').mockReturnValue(false);
    // Act
    const result = component.shouldRender;
    // Assert
    expect(result).toBe(false);
  });
});
