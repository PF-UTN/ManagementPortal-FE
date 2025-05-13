import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RegistrationRequestListItem } from '../models/registration-request-item.model';
import { RegistrationRequestParams } from '../models/registration-request-param.model';

export interface SearchRegistrationRequestResponse {
  total: number;
  results: RegistrationRequestListItem[];
}

@Injectable({
  providedIn: 'root',
})
export class RegistrationRequestService {
  private readonly baseUrl =
    'https://dev-management-portal-be.vercel.app/registration-request';

  constructor(private readonly http: HttpClient) {}

  postSearchRegistrationRequest(
    params: RegistrationRequestParams,
  ): Observable<SearchRegistrationRequestResponse> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<SearchRegistrationRequestResponse>(url, params);
  }

  approveRegistrationRequest(id: number, note: string): Observable<void> {
    const url = `${this.baseUrl}/${id}/approve`;
    const body = { note };
    return this.http.post<void>(url, body);
  }

  rejectRegistrationRequest(id: number, note: string): Observable<void> {
    const url = `${this.baseUrl}/${id}/reject`;
    const body = { note };
    return this.http.post<void>(url, body);
  }
}
