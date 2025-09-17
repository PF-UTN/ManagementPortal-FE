import { Cart, CartItem, CartService } from '@Cart';
import {
  ButtonComponent,
  LateralDrawerService,
  LoadingComponent,
  TitleComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

import { DetailLateralCartDrawerComponent } from '../detail-lateral-drawer/detail-lateral-cart-drawer.component';

@Component({
  selector: 'mp-shopping-cart',
  standalone: true,
  imports: [
    LoadingComponent,
    TitleComponent,
    CommonModule,
    ButtonComponent,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.scss',
})
export class ShoppingCartComponent implements OnInit {
  constructor(
    private readonly cartService: CartService,
    private readonly snackBar: MatSnackBar,
    private readonly lateralDrawerService: LateralDrawerService,
    private router: Router,
  ) {}

  isLoading = signal(true);
  data = signal<Cart | null>(null);
  error = signal<string | null>(null);
  noDataMessage = 'Su carrito esta vacío';
  private quantitySubjects: Map<number, Subject<number>> = new Map();

  totalQuantity = computed(() =>
    this.data()
      ? this.data()!.items.reduce((total, item) => total + item.quantity, 0)
      : 0,
  );

  totalPrice = computed(() =>
    this.data()
      ? this.data()!.items.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0,
        )
      : 0,
  );

  ngOnInit() {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.data.set(cart);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load cart');
        this.isLoading.set(false);
      },
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    this.cartService
      .addProductToCart({
        productId: item.product.id,
        quantity: newQuantity,
      })
      .subscribe({
        next: () => {
          const cart = this.data();
          if (cart) {
            const updatedItems = cart.items.map((i) =>
              i.product.id === item.product.id
                ? { ...i, quantity: newQuantity }
                : i,
            );
            this.data.set({ ...cart, items: updatedItems });
          }
          this.snackBar.open('Cantidad actualizada', 'Cerrar', {
            duration: 5000,
          });
        },
        error: () =>
          this.snackBar.open('No se pudo actualizar la cantidad', 'Cerrar', {
            duration: 3000,
          }),
      });
  }
  increaseQuantity(item: CartItem): void {
    const maxStock = item.product.stock?.quantityAvailable ?? Infinity;
    if (item.quantity < maxStock) {
      this.emitQuantityChange(item, item.quantity + 1);
    } else {
      this.snackBar.open('No hay suficiente stock disponible', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  decreaseQuantity(item: CartItem): void {
    this.emitQuantityChange(item, item.quantity - 1);
  }

  removeItem(item: CartItem): void {
    const cart = this.data();
    if (cart) {
      const updatedItems = cart.items.filter(
        (i) => i.product.id !== item.product.id,
      );
      this.data.set({ ...cart, items: updatedItems });
    }

    this.cartService
      .deleteCartProduct({ productId: item.product.id })
      .subscribe({
        next: () => {
          this.snackBar.open('Producto eliminado del carrito', 'Cerrar', {
            duration: 5000,
          });
        },
        error: () => {
          this.snackBar.open('No se pudo eliminar el producto', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }
  emitQuantityChange(item: CartItem, newQuantity: number): void {
    const cart = this.data();
    if (cart) {
      const updatedItems = cart.items.map((i) =>
        i.product.id === item.product.id ? { ...i, quantity: newQuantity } : i,
      );
      this.data.set({ ...cart, items: updatedItems });
    }

    if (!this.quantitySubjects.has(item.product.id)) {
      const subject = new Subject<number>();
      subject.pipe(debounceTime(500)).subscribe((quantity) => {
        this.updateQuantity(item, quantity);
      });
      this.quantitySubjects.set(item.product.id, subject);
    }
    this.quantitySubjects.get(item.product.id)!.next(newQuantity);
  }

  emitQuantityChangeInput(item: CartItem, newQuantity: number): void {
    if (!this.quantitySubjects.has(item.product.id)) {
      const subject = new Subject<number>();
      subject.pipe(debounceTime(500)).subscribe((quantity) => {
        const cart = this.data();
        if (cart) {
          const updatedItems = cart.items.map((i) =>
            i.product.id === item.product.id ? { ...i, quantity: quantity } : i,
          );
          this.data.set({ ...cart, items: updatedItems });
        }
        this.updateQuantity(item, quantity);
      });
      this.quantitySubjects.set(item.product.id, subject);
    }
    this.quantitySubjects.get(item.product.id)!.next(newQuantity);
  }

  openProductDrawer(productId: number, quantity: number): void {
    this.lateralDrawerService.open(
      DetailLateralCartDrawerComponent,
      { productId, quantity },
      {
        title: 'Detalle del Producto',
        footer: {
          firstButton: {
            text: 'Cancelar',
            click: () => this.lateralDrawerService.close(),
          },
        },
      },
    );
  }
  onQuantityInput(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    const maxStock = item.product.stock?.quantityAvailable ?? Infinity;

    if (value < 1 || isNaN(value)) {
      value = 1;
      input.value = '1';
    } else if (value > maxStock) {
      value = maxStock;
      input.value = String(maxStock);
      this.snackBar.open('No hay suficiente stock disponible', 'Cerrar', {
        duration: 3000,
      });
    }

    this.emitQuantityChangeInput(item, value);
  }
  goToProducts(): void {
    this.router.navigate(['productos/cliente']);
  }
}
