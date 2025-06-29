import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductCategoryRequest } from '../models/product-category-request.model';
import { ProductCategoryResponse } from '../models/product-category-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService {
  private readonly baseUrl =
    'https://dev-management-portal-be.vercel.app/product-categories';

  constructor(private readonly http: HttpClient) {}

  postCreateOrUpdateProductCategoryAsync(
    productCategory: ProductCategoryRequest,
  ): Observable<ProductCategoryResponse> {
    return this.http.post<ProductCategoryResponse>(
      `${this.baseUrl}/`,
      productCategory,
    );
  }

  getCategoriesAsync(): Observable<ProductCategoryResponse[]> {
    const url = `${this.baseUrl}/`;
    return this.http.get<ProductCategoryResponse[]>(url);
  }
}
