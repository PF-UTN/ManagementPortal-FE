import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SearchVehicleResponse } from '../models/search-vehicle-response.model';
import { VehicleParams } from '../models/vehicle-params.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private readonly baseUrl = environment.apiBaseUrl + '/vehicle';
  constructor(private readonly http: HttpClient) {}

  postSearchVehiclesAsync(
    params: VehicleParams,
  ): Observable<SearchVehicleResponse> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<SearchVehicleResponse>(url, params);
  }
}
