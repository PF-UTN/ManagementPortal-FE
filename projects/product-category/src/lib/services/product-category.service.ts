import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProductCategoryResponse } from 'projects/product/src/lib/models/product-category-response.model';
import { Observable } from 'rxjs';

import { ProductCategory } from '../models/product-category.model';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService {
  private readonly baseUrl =
    'https://dev-management-portal-be.vercel.app/product-categories';

  constructor(private readonly http: HttpClient) {}

  postCreateOrUpdateProductCategoryAsync(
    productCategory: ProductCategory,
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
