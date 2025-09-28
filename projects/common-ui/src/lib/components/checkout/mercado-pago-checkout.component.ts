import { CommonModule } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';

import { CheckoutService } from './services/checkout.service';
import { ButtonComponent } from '../button/button.component';
import { CheckoutResponse } from './models/checkout-response.model';

@Component({
  selector: 'mp-mercado-pago-checkout',
  templateUrl: './mercado-pago-checkout.component.html',
  standalone: true,
  imports: [ButtonComponent, CommonModule],
  providers: [CheckoutService],
})
export class MercadoPagoCheckoutComponent implements OnInit {
  orderId = input<string>();
  isDisabled = input(false);
  isLoading = signal(false);
  checkoutPreferences: CheckoutResponse;

  constructor(private checkoutService: CheckoutService) {}

  ngOnInit(): void {
    this.isLoading.set(true);
    this.checkoutService
      .createOrderCheckoutPreferences(this.orderId()!)
      .subscribe((checkoutPreferences) => {
        this.checkoutPreferences = checkoutPreferences;
        this.isLoading.set(false);
      });
  }

  handlePay() {
    window.location.href = this.checkoutPreferences.init_point;
  }
}
