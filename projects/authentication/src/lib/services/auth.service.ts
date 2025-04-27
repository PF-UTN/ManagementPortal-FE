import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthResponse } from '../models/auth-response.model';
import { Client } from '../models/client.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://dev-management-portal-be.vercel.app/authentication';

  constructor(private http: HttpClient) {}

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  signUpAsync(client: Client): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/signup`, client)
      .pipe(tap((response) => this.setToken(response.access_token)));
  }

  logInAsync(credential: User): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/signin`, credential)
      .pipe(
        tap((response) => {
          this.setToken(response.access_token);
        }),
      );
  }
}
