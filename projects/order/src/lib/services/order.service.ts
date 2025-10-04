import { environment } from '@Common';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { OrderClientSearchRequest } from '../models/order-client-request-model';
import { OrderClientSearchResponse } from '../models/order-client-response.model';
import { OrderCreatePayload } from '../models/order-created.model';
import { OrderClientDetail } from '../models/order-detail-client.model';
import { OrderParams } from '../models/order-params.model';
import { OrderSearchRequest } from '../models/order-request-model';
import { OrderSearchResponse } from '../models/order-response-model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly baseUrl = environment.apiBaseUrl + '/order';

  constructor(private readonly http: HttpClient) {}

  searchClientOrders(
    body: OrderClientSearchRequest,
    token: string | null,
  ): Observable<OrderClientSearchResponse> {
    const url = `${this.baseUrl}/client/search`;
    let headers: HttpHeaders | undefined = undefined;
    if (token) {
      headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return this.http.post<OrderClientSearchResponse>(
      url,
      body,
      headers ? { headers } : {},
    );
  }

  searchOrders(body: OrderSearchRequest): Observable<OrderSearchResponse> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<OrderSearchResponse>(url, body);
  }

  downloadOrderList(params: OrderParams) {
    const url = `${this.baseUrl}/download`;
    return this.http.post(url, params, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  getOrderClientDetail(orderId: number): Observable<OrderClientDetail> {
    const url = `${this.baseUrl}/client/${orderId}`;
    return this.http.get<OrderClientDetail>(url);
  }

  createOrder(payload: OrderCreatePayload): Observable<void> {
    const url = `${this.baseUrl}`;
    return this.http.post<void>(url, payload);
  }
}
