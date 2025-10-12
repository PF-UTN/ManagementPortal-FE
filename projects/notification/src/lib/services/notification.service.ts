import { environment } from '@Common';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { UserNotification } from '../models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly baseUrl = environment.apiBaseUrl + '/notification';

  private _unreadCount$ = new BehaviorSubject<number>(0);
  unreadCount$ = this._unreadCount$.asObservable();

  constructor(private readonly http: HttpClient) {}

  getNotifications(): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(this.baseUrl).pipe(
      tap((notifications) => {
        const count = notifications.filter((n) => !n.viewed).length;
        this._unreadCount$.next(count);
      }),
    );
  }

  markAsViewed(id: number): Observable<UserNotification[]> {
    return this.http
      .patch<void>(`${this.baseUrl}/${id}/mark-as-viewed`, {})
      .pipe(switchMap(() => this.getNotifications()));
  }

  markAllAsViewed(): Observable<UserNotification[]> {
    return this.http
      .patch<void>(`${this.baseUrl}/mark-all-as-viewed`, {})
      .pipe(switchMap(() => this.getNotifications()));
  }

  deleteNotification(id: number): Observable<UserNotification[]> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(switchMap(() => this.getNotifications()));
  }
}
