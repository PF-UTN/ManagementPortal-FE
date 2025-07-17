import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SupplierCreateUpdateResponse } from '../models/supplier-create-update-response.model';
import { SupplierResponse } from '../models/supplier-response.model';
import { SupplierDetail } from '../models/supplier.detail.model';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly baseUrl = environment.apiBaseUrl + '/supplier';

  constructor(private readonly http: HttpClient) {}

  postCreateOrUpdateSupplierAsync(
    supplier: Supplier,
  ): Observable<SupplierCreateUpdateResponse> {
    return this.http.post<SupplierCreateUpdateResponse>(
      `${this.baseUrl}/`,
      supplier,
    );
  }

  getSuppliers(): Observable<SupplierResponse[]> {
    return this.http.get<SupplierResponse[]>(this.baseUrl);
  }

  getSupplierByDocumentAsync(
    documentType: string,
    documentNumber: string,
  ): Observable<SupplierDetail> {
    return this.http.get<SupplierDetail>(
      `${this.baseUrl}/search?documentType=${documentType}&documentNumber=${documentNumber}`,
    );
  }

  getSuppliersAsync(): Observable<SupplierCreateUpdateResponse[]> {
    return this.http.get<SupplierCreateUpdateResponse[]>(this.baseUrl);
  }
}
