import { environment } from '@Common';
import { NotificationService } from '@Notification';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, interval, of, Subscription, take } from 'rxjs';

@Component({
  selector: 'mp-home',
  standalone: true,
  imports: [],
  template: ` <iframe [src]="lookerUrl" width="100%" height="100%"></iframe>`,
  styles: ``,
})
export class HomeComponent implements OnInit, OnDestroy {
  lookerUrl: string;
  private notifIntervalSub?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.lookerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      environment.lookerUrl,
    ) as string;

    this.notificationService
      .getNotifications()
      .pipe(
        take(1),
        catchError(() => of(null)),
      )
      .subscribe();

    this.notifIntervalSub = interval(21_600_000).subscribe(() => {
      this.notificationService
        .getNotifications()
        .pipe(
          take(1),
          catchError(() => of(null)),
        )
        .subscribe();
    });
  }

  ngOnDestroy(): void {
    this.notifIntervalSub?.unsubscribe();
  }
}
