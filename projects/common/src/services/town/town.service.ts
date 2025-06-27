import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { TownListItem } from '../../models/town-item.model';
import { TownParams } from '../../models/town-param.model';

export interface SearchTownsResponse {
  total: number;
  results: TownListItem[];
}

@Injectable({
  providedIn: 'root',
})
export class TownService {
  private baseUrl = 'https://dev-management-portal-be.vercel.app/towns';

  constructor(private http: HttpClient) {}

  searchTowns(params: TownParams): Observable<SearchTownsResponse> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<SearchTownsResponse>(url, params);
  }
}
