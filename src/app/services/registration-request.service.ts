import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RegistrationRequestListItem } from '../models/registration-request-item.model';
import { RegistrationRequestParams } from '../models/registration-request-param.model';

export interface SearchRegistrationRequestResponse {
  total: number;
  results: RegistrationRequestListItem[];
}

export interface ApproveResponse {
  message: string;
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

  approveRegistrationRequest(
    id: number,
    note: string,
  ): Observable<ApproveResponse> {
    const url = `${this.baseUrl}/${id}/approve`;
    const body = { note };
    return this.http.post<ApproveResponse>(url, body);
  }
}
