import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SupplierResponse } from '../models/supplier-response.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly baseUrl =
    'https://dev-management-portal-be.vercel.app/supplier';

  constructor(private readonly http: HttpClient) {}

  getSuppliers(): Observable<SupplierResponse[]> {
    return this.http.get<SupplierResponse[]>(this.baseUrl);
  }
}
