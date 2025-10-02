import { CartService } from '@Cart';
import { ButtonComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mp-cart-badge-button',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ButtonComponent],
  templateUrl: './cart-badge-button.component.html',
  styleUrl: './cart-badge-button.component.scss',
})
export class CartBadgeButtonComponent implements OnInit, OnDestroy {
  count = 0;
  private cartSub?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(); // Fuerza la carga inicial
    this.cartSub = this.cartService.cart$.subscribe((cart) => {
      this.count = cart.items ? cart.items.length : 0;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  goToCart(): void {
    this.router.navigate(['/carrito']);
  }
}
