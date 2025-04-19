import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RegistrationRequestListItem } from '../models/registration-request-item.model';
import { RegistrationRequestParams } from '../models/registration-request-param.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationRequestService {
  private apiUrl =
    'https://dev-management-portal-be.vercel.app/registration-request/search';

  constructor(private http: HttpClient) {}

  fetchRegistrationRequests(
    params: RegistrationRequestParams,
  ): Observable<{ total: number; results: RegistrationRequestListItem[] }> {
    return this.http.post<{
      total: number;
      results: RegistrationRequestListItem[];
    }>(this.apiUrl, params);
  }
}
