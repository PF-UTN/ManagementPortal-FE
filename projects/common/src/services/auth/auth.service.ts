import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RoleHierarchy } from '../../constants';
import { AuthResponse } from '../../models/auth-response.model';
import { Client } from '../../models/client.model';
import { TokenPayload } from '../../models/token-payload.model';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userRole?: string;

  private readonly apiUrl = 'https://dev-management-portal-be.vercel.app/authentication';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    const token = localStorage.getItem('token');

    if (token) {
      this.setUserRole(token);
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

  hasAccess(allowedRoles: string[]): boolean {
    if (allowedRoles.length === 0) {
      return true;
    }

    if (!this.userRole) {
      return false;
    }

    const userAccessibleRoles = RoleHierarchy[this.userRole];

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

  private setUserRole(token: string): void {
    const decodedToken: TokenPayload = jwtDecode(token);
    this.userRole = decodedToken.role;
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);

    this.setUserRole(token);
  }
}
