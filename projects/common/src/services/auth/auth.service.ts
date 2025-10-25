import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RoleHierarchy } from '../../constants';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../../models/auth-response.model';
import { Client } from '../../models/client.model';
import { TokenPayload } from '../../models/token-payload.model';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userRole: string;
  userName: string;
  userId: string;

  private readonly apiUrl = environment.apiBaseUrl + '/authentication';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    const token = localStorage.getItem('token');

    if (token) {
      this.setPayloadProperties(token);
    }
  }

  logOut() {
    localStorage.removeItem('token');
    this.router.navigate(['autenticacion/inicio-sesion']);
  }

  signUpAsync(client: Client): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, client);
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

  hasAccess(allowedRoles: string[], deniedRoles: string[] = []): boolean {
    if (allowedRoles.length === 0) {
      return true;
    }

    if (!this.userRole) {
      return false;
    }

    if (deniedRoles.includes(this.userRole)) {
      return false;
    }

    const userAccessibleRoles = RoleHierarchy[this.userRole];

    if (
      deniedRoles.some((deniedRole) => userAccessibleRoles.includes(deniedRole))
    ) {
      return false;
    }

    return allowedRoles.some((allowedRole) =>
      userAccessibleRoles.includes(allowedRole),
    );
  }

  resetPasswordRequestAsync(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password/request`, {
      email,
    });
  }

  resetPasswordAsync(token: string, password: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/reset-password`,
      { password },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  }

  private setPayloadProperties(token: string): void {
    const decodedToken: TokenPayload = jwtDecode(token);
    this.userRole = decodedToken.role;
    this.userName = decodedToken.userName;
    this.userId = decodedToken.sub;
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);

    this.setPayloadProperties(token);
  }
}
