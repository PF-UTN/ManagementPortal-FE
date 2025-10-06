import { CartService } from '@Common';

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ButtonComponent } from './../button/button.component';

@Component({
  selector: 'mp-cart-button',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './cart-button.component.html',
  styleUrl: './cart-button.component.scss',
})
export class CartButtonComponent implements OnInit, OnDestroy {
  count = 0;
  private cartSub?: Subscription;

  constructor(
    private router: Router,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe();
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
