import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrationRequestParams } from '../models/registration-request-param.model';
import { RegistrationRequestListItem } from '../models/registration-request-item.model';


@Injectable({
  providedIn: 'root'
})
export class RegistrationRequestService {

  private baseUrl = 'https://dev-management-portal-be.vercel.app/registration-request';
  private header = { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJzdWIiOjEsInBlcm1pc3Npb25zIjpbInJlZ2lzdHJhdGlvbi1yZXF1ZXN0OnJlYWQiLCJyZWdpc3RyYXRpb24tcmVxdWVzdDpjcmVhdGUiLCJyZWdpc3RyYXRpb24tcmVxdWVzdDp1cGRhdGUiLCJyZWdpc3RyYXRpb24tcmVxdWVzdDpkZWxldGUiXSwiaWF0IjoxNzQ0ODk0NjUxLCJleHAiOjE3NDQ4OTgyNTF9.8mqKojg_yiyMkQx9bDl-RETwMIti54NuDd0mJByeEVk' }

  constructor(private http: HttpClient) { }

  fetchRegistrationRequests(params: RegistrationRequestParams):
    Observable<{ total: number; results: RegistrationRequestListItem[] }> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<{
      total: number; results: RegistrationRequestListItem[]
    }>(url, params, { headers: this.header });
  }

  approveRegistrationRequest(id: number, note: string): Observable<void> {
    const url = `${this.baseUrl}/${id}/approve`;
    const body = { note }
    return this.http.post<void>(url, body, { headers: this.header });
  }
}