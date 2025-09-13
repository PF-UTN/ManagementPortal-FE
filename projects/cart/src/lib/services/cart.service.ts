import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CartUpdateProductQuantity } from '../models/cart-update-product-quantity.model';
import { Cart } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly baseUrl = environment.apiBaseUrl + '/cart';
  constructor(private readonly http: HttpClient) {}

  addProductToCart(params: CartUpdateProductQuantity): Observable<void> {
    const url = `${this.baseUrl}/product/quantity`;
    return this.http.post<void>(url, params);
  }

  getCart(): Observable<Cart> {
    const url = `${this.baseUrl}`;
    return this.http.get<Cart>(url);
  }
}
