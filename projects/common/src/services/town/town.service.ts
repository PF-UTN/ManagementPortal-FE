import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Town } from '../../models/town.model';

@Injectable({
  providedIn: 'root',
})
export class TownService {
  private apiUrl = 'https://dev-management-portal-be.vercel.app/';

  constructor(private http: HttpClient) {}

  searchTowns(searchText: string = ''): Observable<Town[]> {
    return this.http.get<Town[]>(`${this.apiUrl}towns`, {
      params: { search: searchText },
    });
  }
}
