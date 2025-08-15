import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PurchaseOrderDetail } from '../models/purchase-order-detail.model';
import { PurchaseOrderParams } from '../models/purchase-order-param.model';
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
}
