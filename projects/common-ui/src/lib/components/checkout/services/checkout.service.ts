import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CheckoutResponse } from '../models/checkout-response.model';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  createOrderCheckoutPreferences(
    orderId: string,
  ): Observable<CheckoutResponse> {
    return this.http.get<CheckoutResponse>(
      this.apiUrl + `/order/checkout/${orderId}`,
    );
  }
}
