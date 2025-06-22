import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SupplierCreateUpdateResponse } from '../models/supplier-create-update-response.model';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly baseUrl =
    'https://dev-management-portal-be.vercel.app/supplier';

  constructor(private readonly http: HttpClient) {}

  postCreateOrUpdateSupplierAsync(
    supplier: Supplier,
  ): Observable<SupplierCreateUpdateResponse> {
    return this.http.post<SupplierCreateUpdateResponse>(
      `${this.baseUrl}/`,
      supplier,
    );
  }
}
