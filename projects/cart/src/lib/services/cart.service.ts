import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';

import { CartUpdateProductQuantity } from '../models/cart-update-product-quantity.model';
import { Cart } from '../models/cart.model';
import { DeleteCartProduct } from '../models/delete-cart-product.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly baseUrl = environment.apiBaseUrl + '/cart';
  private cartSubject = new BehaviorSubject<Cart>({ cartId: '', items: [] });
  cart$ = this.cartSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  addProductToCart(params: CartUpdateProductQuantity): Observable<Cart> {
    const url = `${this.baseUrl}/product/quantity`;
    return this.http
      .post<void>(url, params)
      .pipe(switchMap(() => this.getCart()));
  }

  getCart(): Observable<Cart> {
    const url = `${this.baseUrl}`;
    return this.http
      .get<Cart>(url)
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  deleteCartProduct(params: DeleteCartProduct): Observable<Cart> {
    const url = `${this.baseUrl}/product`;
    return this.http
      .delete<void>(url, { body: params })
      .pipe(switchMap(() => this.getCart()));
  }

  updateCart(cart: Cart): void {
    this.cartSubject.next(cart);
  }
}
