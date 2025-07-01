import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SupplierResponse } from '../models/supplier-response.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly baseUrl = environment.apiBaseUrl + '/supplier';

  constructor(private readonly http: HttpClient) {}

  getSuppliers(): Observable<SupplierResponse[]> {
    return this.http.get<SupplierResponse[]>(this.baseUrl);
  }
}
