import {
  LateralDrawerService,
  LateralDrawerContainer,
  LoadingComponent,
  ButtonComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { UserNotification } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'lib-lateral-drawer-notifications',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    MatIconModule,
    MatButtonModule,
    ButtonComponent,
    MatSnackBarModule,
  ],
  templateUrl: './lateral-drawer-notifications.component.html',
  styleUrl: './lateral-drawer-notifications.component.scss',
})
export class LateralDrawerNotificationsComponent extends LateralDrawerContainer {
  notifications = signal<UserNotification[]>([]);
  isLoading = signal(true);
  private autoRefreshSub?: Subscription;

  constructor(
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly notificationService: NotificationService,
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    effect(() => {
      this.lateralDrawerService.updateConfig({
        ...this.lateralDrawerService.config,
        title: 'Notificaciones',
        size: 'medium',
        footer: {
          firstButton: {
            click: () => this.closeDrawer(),
            text: 'Cerrar',
          },
        },
      });
    });
  }

  ngOnInit(): void {
    this.fetchNotifications(true);
  }

  trackById(index: number, item: UserNotification) {
    return item.id;
  }

  fetchNotifications(showSpinner = false) {
    if (showSpinner) this.isLoading.set(true);
    this.notifications.set([]);
    this.notificationService.getNotifications().subscribe({
      next: (list) => {
        const sorted = [...list].sort((a, b) => {
          if (a.viewed === b.viewed) {
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          }
          return a.viewed ? 1 : -1;
        });
        this.notifications.set(sorted);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  markAsViewed(id: number) {
    const updated = this.notifications().map((n) =>
      n.id === id ? { ...n, viewed: true } : n,
    );
    const sorted = [...updated].sort((a, b) => {
      if (a.viewed === b.viewed) {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
      return a.viewed ? 1 : -1;
    });
    this.notifications.set(sorted);

    this.notificationService.markAsViewed(id).subscribe({
      next: () => {
        this.snackBar.open('Notificación marcada como leída', 'Cerrar', {
          duration: 3000,
        });
      },
      error: () => {
        const reverted = this.notifications().map((n) =>
          n.id === id ? { ...n, viewed: false } : n,
        );
        const sortedReverted = [...reverted].sort((a, b) => {
          if (a.viewed === b.viewed) {
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          }
          return a.viewed ? 1 : -1;
        });
        this.notifications.set(sortedReverted);
        this.snackBar.open(
          'Error al marcar la notificación como leída',
          'Cerrar',
          {
            duration: 3000,
          },
        );
      },
    });
  }

  deleteNotification(id: number) {
    const updated = this.notifications().filter((n) => n.id !== id);
    const sorted = [...updated].sort((a, b) => {
      if (a.viewed === b.viewed) {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
      return a.viewed ? 1 : -1;
    });
    this.notifications.set(sorted);

    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.snackBar.open('Notificación eliminada', 'Cerrar', {
          duration: 3000,
        });
      },
      error: () => {
        this.notifications.set(sorted);
        this.snackBar.open('Error al eliminar la notificación', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  markAllAsViewed() {
    const original = this.notifications();
    this.notifications.set([]);
    setTimeout(() => {
      const updated = original.map((n) => ({ ...n, viewed: true }));
      this.notifications.set(updated);
    });

    this.notificationService.markAllAsViewed().subscribe({
      next: () => {
        this.snackBar.open('Notificaciones marcadas como leídas', 'Cerrar', {
          duration: 3000,
        });
      },
      error: () => {
        this.notifications.set(original);
        this.snackBar.open(
          'Error al marcar todas las notificaciones como leídas',
          'Cerrar',
          { duration: 3000 },
        );
      },
    });
  }

  closeDrawer() {
    this.lateralDrawerService.close();
  }

  get hasUnviewedNotifications(): boolean {
    return this.notifications().some((n) => !n.viewed);
  }
}
