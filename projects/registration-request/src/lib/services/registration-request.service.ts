import { environment } from '@Common';

import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DownloadRegistrationRequestRequest } from '../models/download-registration-request.request';
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
  private readonly baseUrl = environment.apiBaseUrl + '/registration-request';

  constructor(private readonly http: HttpClient) {}

  postSearchRegistrationRequest(
    params: RegistrationRequestParams,
  ): Observable<SearchRegistrationRequestResponse> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<SearchRegistrationRequestResponse>(url, params);
  }

  postDownloadRegistrationRequest(
    params: DownloadRegistrationRequestRequest,
  ): Observable<HttpResponse<Blob>> {
    const url = `${this.baseUrl}/download`;
    return this.http.post(url, params, {
      observe: 'response',
      responseType: 'blob',
    });
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
