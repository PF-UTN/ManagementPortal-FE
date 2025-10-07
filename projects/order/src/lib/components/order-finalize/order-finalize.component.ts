import { AuthService, CartService, Cart } from '@Common';
import {
  TitleComponent,
  BackArrowComponent,
  LoadingComponent,
  ButtonComponent,
  CheckoutService,
  CheckoutResponse,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { forkJoin } from 'rxjs';

import { Client } from '../../models/client-response.model';
import { OrderCreatePayload } from '../../models/order-created.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'mp-order-finalize',
  standalone: true,
  imports: [
    TitleComponent,
    BackArrowComponent,
    MatStepperModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
    MatSnackBarModule,
    LoadingComponent,
    ButtonComponent,
  ],
  templateUrl: './order-finalize.component.html',
  styleUrl: './order-finalize.component.scss',
})
export class OrderFinalizeComponent implements OnInit {
  userId: string;
  isLinear = true;
  selectedShipping: string | null = null;
  selectedPayment: string | null = null;
  clientAddress: Client['address'] | null = null;
  cart: Cart | null = null;
  isLoading = signal(false);
  isSubmitting = signal(false);
  checkoutPreferences: CheckoutResponse;

  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly snackBar: MatSnackBar,
    private readonly authService: AuthService,
    private checkoutService: CheckoutService,
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.userId;
    const token = localStorage.getItem('token') ?? undefined;
    this.isLoading.set(true);

    forkJoin({
      cart: this.cartService.getCart(),
      client: this.orderService.getClient(token),
    }).subscribe({
      next: ({ cart, client }) => {
        this.cart = cart;
        this.clientAddress = client.address;
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.clientAddress = null;
      },
    });
  }

  handleFinalizeClick() {
    if (!this.cart || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    let orderStatusId = 1;
    if (this.selectedPayment === 'tarjeta') {
      orderStatusId = 7;
    } else if (
      this.selectedPayment === 'entrega' &&
      this.selectedShipping === 'sucursal'
    ) {
      orderStatusId = 2;
    }

    const payload: OrderCreatePayload = {
      clientId: this.userId,
      orderStatusId,
      paymentDetail: {
        paymentTypeId: this.selectedPayment === 'tarjeta' ? 1 : 2,
      },
      deliveryMethodId: this.selectedShipping === 'sucursal' ? 1 : 2,
      orderItems: this.cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
    };

    this.orderService.createOrder(payload).subscribe({
      next: (orderResponse: { id: number }) => {
        if (this.selectedPayment === 'tarjeta') {
          this.checkoutService
            .createOrderCheckoutPreferences(orderResponse.id.toString())
            .subscribe((checkoutPreferences) => {
              this.checkoutPreferences = checkoutPreferences;
              this.isLoading.set(false);
              if (checkoutPreferences && checkoutPreferences.init_point) {
                window.location.href = checkoutPreferences.init_point;
              }
            });
        } else {
          this.snackBar.open('¡Su pedido fue realizado con éxito!', 'Cerrar', {
            duration: 3000,
          });
          this.cartService.deleteCart().subscribe({
            complete: () => {
              this.isSubmitting.set(false);
              globalThis.location.href = '/pedidos/cliente';
            },
            error: () => {
              this.isSubmitting.set(false);
              globalThis.location.href = '/pedidos/cliente';
            },
          });
        }
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  get cartTotal(): number {
    if (!this.cart) return 0;
    return this.cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
  }

  get finalTotal(): number {
    return this.cartTotal + this.taxes;
  }

  get taxes(): number {
    return this.cartTotal * 0.05;
  }
}
