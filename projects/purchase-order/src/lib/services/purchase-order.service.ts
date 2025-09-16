import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PostUpdatePurchaseOrderStatusRequest } from '../models/post-cancel-purchase-order-request.model';
import { PurchaseOrderDetail } from '../models/purchase-order-detail.model';
import {
  PurchaseOrderParams,
  PurchaseOrder,
} from '../models/purchase-order-param.model';
import { PutUpdatePurchaseOrderRequest } from '../models/put-update-purchase-order-request.model';
import { SearchPurchaseOrderResponse } from '../models/search-purchase-order-response.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private readonly baseUrl = environment.apiBaseUrl + '/purchase-order';
  constructor(private readonly http: HttpClient) {}

  searchWithFiltersAsync(
    params: PurchaseOrderParams,
  ): Observable<SearchPurchaseOrderResponse> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<SearchPurchaseOrderResponse>(url, params);
  }

  getPurchaseOrderById(id: number): Observable<PurchaseOrderDetail> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<PurchaseOrderDetail>(url);
  }

  deletePurchaseOrderAsync(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  createPurchaseOrder(purchaseOrder: PurchaseOrder) {
    const url = `${this.baseUrl}`;
    return this.http.post(url, purchaseOrder);
  }

  updatePurchaseOrderStatusAsync(
    id: number,
    request: PostUpdatePurchaseOrderStatusRequest,
  ): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.patch<void>(url, request);
  }

  updatePurchaseOrderAsync(
    id: number,
    request: PutUpdatePurchaseOrderRequest,
  ): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<void>(url, request);
  }

  downloadPurchaseOrderList(params: PurchaseOrderParams) {
    const url = `${this.baseUrl}/download`;
    return this.http.post(url, params, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
