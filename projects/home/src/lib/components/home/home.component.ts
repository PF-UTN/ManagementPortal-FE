import { NotificationService } from '@Notification';

import { Component, OnInit } from '@angular/core';
import { catchError, of, take } from 'rxjs';

@Component({
  selector: 'mp-home',
  standalone: true,
  imports: [],
  template: `
    <iframe
      src="https://lookerstudio.google.com/embed/reporting/7e884610-5c4b-465c-82c4-5b4c2eea7dd0/page/IphaF"
      width="100%"
      height="99%"
    ></iframe>
  `,
  styles: ``,
})
export class HomeComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService
      .getNotifications()
      .pipe(
        take(1),
        catchError(() => of(null)),
      )
      .subscribe();
  }
}
