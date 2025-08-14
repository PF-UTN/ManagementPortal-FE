import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  PurchaseOrderParams,
  PurchaseOrder,
} from '../models/purchase-order-param.model';
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

  createPurchaseOrder(purchaseOrder: PurchaseOrder) {
    const url = 'https://dev-management-portal-be.vercel.app/purchase-order';
    return this.http.post(url, purchaseOrder);
  }
}
