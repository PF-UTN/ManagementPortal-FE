import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ShipmentDetail } from '../models/shipment-deatil.model';
import {
  ShipmentSearchFilters,
  ShipmentSearchRequest,
  ShipmentSearchResponse,
} from '../models/shipment-search.model';

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {
  private readonly baseUrl = environment.apiBaseUrl + '/shipment';

  constructor(private readonly http: HttpClient) {}

  searchShipments(
    body: ShipmentSearchRequest,
  ): Observable<ShipmentSearchResponse> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<ShipmentSearchResponse>(url, body);
  }

  downloadShipments(body: {
    searchText: string;
    filters?: ShipmentSearchFilters;
  }) {
    const url = `${this.baseUrl}/download`;
    return this.http.post(url, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  getShipmentById(shipmentId: number): Observable<ShipmentDetail> {
    const url = `${this.baseUrl}/${shipmentId}`;
    return this.http.get<ShipmentDetail>(url);
  }

  sendShipment(shipmentId: number): Observable<{ link: string }> {
    const url = `${this.baseUrl}/${shipmentId}/send`;
    return this.http.patch<{ link: string }>(url, {});
  }
}
