import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductParams } from '../models/product-param.model';
import { SearchProductResponse } from '../models/search-product-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl =
    'https://dev-management-portal-be.vercel.app/product';

  constructor(private readonly http: HttpClient) {}

  postSearchProduct(params: ProductParams): Observable<SearchProductResponse> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<SearchProductResponse>(url, params);
  }
}
