import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MercadoPagoCheckoutComponent } from './mercado-pago-checkout.component';
import { CheckoutResponse } from './models/checkout-response.model';
import { CheckoutService } from './services/checkout.service';
describe('MercadoPagoCheckoutComponent', () => {
  let fixture: ComponentFixture<MercadoPagoCheckoutComponent>;
  let component: MercadoPagoCheckoutComponent;

  const checkoutResponse = {
    id: 'pref_123',
    init_point: 'https://checkout.mercadopago.com/init',
    items: [],
  } as CheckoutResponse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MercadoPagoCheckoutComponent, HttpClientTestingModule],
      providers: [
        {
          provide: CheckoutService,
          useValue: {
            createOrderCheckoutPreferences: jest
              .fn()
              .mockReturnValue(of(checkoutResponse)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MercadoPagoCheckoutComponent);
    component = fixture.componentInstance;
  });

  describe('handlePay', () => {
    it('should redirect to checkout init_point', () => {
      // Arrange
      component.checkoutPreferences = checkoutResponse;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).location;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).location = { href: '' };

      // Act
      component.handlePay();

      // Assert
      expect(window.location.href).toBe(checkoutResponse.init_point);
    });
  });
});
