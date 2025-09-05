import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductCategoryResponse } from '../models/product-category-response.model';
import { ProductCreate } from '../models/product-create-param.model';
import { ProductResponse } from '../models/product-create-response.model';
import { ProductDetail } from '../models/product-detail.model';
import { ProductParams } from '../models/product-param.model';
import { SearchProductResponse } from '../models/search-product-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = environment.apiBaseUrl + '/product';
  constructor(private readonly http: HttpClient) {}

  postSearchProduct(params: ProductParams): Observable<SearchProductResponse> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<SearchProductResponse>(url, params);
  }

  deletedProduct(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  createProduct(params: ProductCreate): Observable<ProductResponse> {
    const url = `${this.baseUrl}`;
    return this.http.post<ProductResponse>(url, params);
  }

  toggleProductStatus(productId: number, enabled: boolean): Observable<void> {
    const url = `${this.baseUrl}/${productId}/toggle`;
    return this.http.patch<void>(url, { enabled: !enabled });
  }

  updateProduct(
    productId: number,
    params: ProductCreate,
  ): Observable<ProductResponse> {
    const url = `${this.baseUrl}/${productId}`;
    return this.http.put<ProductResponse>(url, params);
  }

  getCategories(): Observable<ProductCategoryResponse[]> {
    const url = `${this.baseUrl}-category`;
    return this.http.get<ProductCategoryResponse[]>(url);
  }

  getProductById(id: number): Observable<ProductDetail> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<ProductDetail>(url);
  }

  changeProductStock(params: {
    productId: number;
    changes: Array<{
      changedField: 'Available' | 'Reserved' | 'Ordered';
      previousValue: number;
      newValue: number;
    }>;
    reason: string;
  }): Observable<void> {
    const url = `${this.baseUrl}/stock-change`;
    return this.http.post<void>(url, params);
  }
}
