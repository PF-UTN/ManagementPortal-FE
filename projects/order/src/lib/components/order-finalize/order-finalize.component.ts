import { CartService, Cart } from '@Cart';
import { AuthService } from '@Common';
import {
  TitleComponent,
  BackArrowComponent,
  LoadingComponent,
  ButtonComponent,
} from '@Common-UI';
import { OrderService } from '@Order';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';

import { OrderCreatePayload } from '../../models/order-created.model';

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
  cart: Cart | null = null;
  isLoading = true;
  isSubmitting = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.userId;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  createOrder() {
    if (!this.cart || this.isSubmitting) return;
    this.isSubmitting = true;

    let orderStatusId = 1;
    if (this.selectedPayment === 'tarjeta') {
      orderStatusId = 7;
    } else if (
      this.selectedPayment === 'entrega' &&
      this.selectedShipping === 'sucursal'
    ) {
      orderStatusId = 2;
    } else if (
      this.selectedPayment === 'entrega' &&
      this.selectedShipping === 'domicilio'
    ) {
      orderStatusId = 1;
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
      next: () => {
        this.snackBar.open('¡Su compra fue realizada con éxito!', 'Cerrar', {
          duration: 3000,
        });
        this.cartService.deleteCart().subscribe({
          complete: () => {
            this.isSubmitting = false;
            window.location.href = '/pedidos/cliente';
          },
          error: () => {
            this.isSubmitting = false;
            window.location.href = '/pedidos/cliente';
          },
        });
      },
      error: () => {
        this.isSubmitting = false;
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

  get shippingCost(): number {
    return this.selectedShipping === 'domicilio' ? 15000 : 0;
  }

  get finalTotal(): number {
    return this.cartTotal + this.shippingCost + this.taxes;
  }

  get taxes(): number {
    return this.cartTotal * 0.05;
  }
}
