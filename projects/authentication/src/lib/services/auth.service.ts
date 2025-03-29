import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { User } from '../models/user.model';
import { AuthResponse } from '../models/auth-response.model';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://dev-management-portal-be.vercel.app/authentication';

  constructor(private http: HttpClient) {}

  signUpAsync(client: Client): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, client);
  }

  logInAsync(credential: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, credential);
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  logInAndSaveToken(credential: User): Observable<AuthResponse> {
    return new Observable(observer => {
      this.logInAsync(credential).subscribe({
        next: (response) => {
          this.setToken(response.token);  
          observer.next(response);  
        },
        error: (err) => {
          observer.error(err);  
        }
      });
    });
  }

  signUpAndSaveToken(client: Client): Observable<AuthResponse> {
    return new Observable(observer => {
      this.signUpAsync(client).subscribe({
        next: (response) => {
          this.setToken(response.token); 
          observer.next(response);  
        },
        error: (err) => {
          observer.error(err);  
        }
      });
    });
  }

}
