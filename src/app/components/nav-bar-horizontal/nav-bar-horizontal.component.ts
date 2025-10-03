import { CartService } from '@Cart';
import { AuthService, RolesEnum } from '@Common';
import { ButtonComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mp-nav-bar-horizontal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './nav-bar-horizontal.component.html',
  styleUrl: './nav-bar-horizontal.component.scss',
})
export class NavBarHorizontalComponent implements OnInit, OnDestroy {
  count = 0;
  private cartSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService,
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
  get shouldRender(): boolean {
    return this.authService.hasAccess([RolesEnum.Client, RolesEnum.Admin]);
  }

  goToCart(): void {
    this.router.navigate(['/carrito']);
  }
}
