import { environment } from '@Common';
import { NotificationService } from '@Notification';

import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, of, take } from 'rxjs';

@Component({
  selector: 'mp-home',
  standalone: true,
  imports: [],
  template: ` <iframe [src]="lookerUrl" class="d-block w-100 h-100"></iframe>`,
  styles: ``,
})
export class HomeComponent implements OnInit {
  lookerUrl: string;

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
  }
}
