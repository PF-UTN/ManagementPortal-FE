import { environment } from '@Common';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { OrderClientSearchRequest } from '../models/order-client-request-model';
import { OrderClientSearchResponse } from '../models/order-client-response.model';
import { OrderClientDetail } from '../models/order-detail-client.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private baseUrl = environment.apiBaseUrl + '/order';

  constructor(private http: HttpClient) {}

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

  getOrderClientDetail(orderId: number): Observable<OrderClientDetail> {
    const url = `${this.baseUrl}/client/${orderId}`;
    return this.http.get<OrderClientDetail>(url);
  }
}
