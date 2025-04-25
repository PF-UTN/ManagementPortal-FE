import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RegistrationRequestListItem } from '../models/registration-request-item.model';
import { RegistrationRequestParams } from '../models/registration-request-param.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationRequestService {
  private baseUrl =
    'https://dev-management-portal-be.vercel.app/registration-request';
  private header = { Authorization: 'Bearer ' };

  constructor(private http: HttpClient) {}

  fetchRegistrationRequests(
    params: RegistrationRequestParams,
  ): Observable<{ total: number; results: RegistrationRequestListItem[] }> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<{
      total: number;
      results: RegistrationRequestListItem[];
    }>(url, params, { headers: this.header });
  }

  approveRegistrationRequest(id: number, note: string) {
    const url = `${this.baseUrl}/${id}/approve`;
    const body = { note };
    return this.http.post(url, body, { headers: this.header });
  }
}
