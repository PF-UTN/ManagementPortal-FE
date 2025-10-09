import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { LateralDrawerNotificationsComponent } from './lateral-drawer-notifications.component';
import { UserNotification } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';

const mockNotifications: UserNotification[] = [
  { id: 1, timestamp: new Date(), message: 'Test 1', viewed: false },
  { id: 2, timestamp: new Date(), message: 'Test 2', viewed: true },
];

describe('LateralDrawerNotificationsComponent', () => {
  let component: LateralDrawerNotificationsComponent;
  let fixture: ComponentFixture<LateralDrawerNotificationsComponent>;
  let notificationService: NotificationService;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LateralDrawerNotificationsComponent,
        CommonModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: mockDeep<NotificationService>(),
        },
        {
          provide: MatSnackBar,
          useValue: { open: jest.fn() },
        },
      ],
    }).compileComponents();

    notificationService = TestBed.inject(NotificationService);
    snackBar = TestBed.inject(MatSnackBar);

    fixture = TestBed.createComponent(LateralDrawerNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchNotifications', () => {
    it('should fetch and sort notifications', () => {
      jest
        .spyOn(notificationService, 'getNotifications')
        .mockReturnValue(of(mockNotifications));
      component.fetchNotifications(true);
      expect(notificationService.getNotifications).toHaveBeenCalled();
      expect(component.notifications().length).toBe(2);
      expect(component.notifications()[0].viewed).toBe(false); // No leídas primero
    });
  });

  describe('markAsViewed', () => {
    it('should update notification as viewed locally and call service', () => {
      jest
        .spyOn(notificationService, 'markAsViewed')
        .mockReturnValue(of(mockNotifications));
      component.notifications.set(mockNotifications);

      component.markAsViewed(1);

      expect(notificationService.markAsViewed).toHaveBeenCalledWith(1);
      expect(component.notifications().find((n) => n.id === 1)?.viewed).toBe(
        true,
      );
      expect(snackBar.open).toHaveBeenCalledWith(
        'Notificación marcada como leída',
        'Cerrar',
        { duration: 3000 },
      );
    });

    it('should revert local change on error', () => {
      jest
        .spyOn(notificationService, 'markAsViewed')
        .mockReturnValue(throwError(() => new Error('Error')));
      component.notifications.set(mockNotifications);

      component.markAsViewed(1);

      expect(notificationService.markAsViewed).toHaveBeenCalledWith(1);
      expect(component.notifications().find((n) => n.id === 1)?.viewed).toBe(
        false,
      );
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error al marcar la notificación como leída',
        'Cerrar',
        { duration: 3000 },
      );
    });
  });

  describe('deleteNotification', () => {
    it('should remove notification locally and call service', () => {
      jest
        .spyOn(notificationService, 'deleteNotification')
        .mockReturnValue(of(mockNotifications));
      component.notifications.set(mockNotifications);

      component.deleteNotification(1);

      expect(notificationService.deleteNotification).toHaveBeenCalledWith(1);
      expect(component.notifications().find((n) => n.id === 1)).toBeUndefined();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Notificación eliminada',
        'Cerrar',
        { duration: 3000 },
      );
    });

    it('should keep local list unchanged on error', () => {
      jest
        .spyOn(notificationService, 'deleteNotification')
        .mockReturnValue(throwError(() => new Error('Error')));
      component.notifications.set(mockNotifications);

      component.deleteNotification(1);

      expect(notificationService.deleteNotification).toHaveBeenCalledWith(1);
      expect(component.notifications().find((n) => n.id === 1)).toBeUndefined();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error al eliminar la notificación',
        'Cerrar',
        { duration: 3000 },
      );
    });
  });

  describe('markAllAsViewed', () => {
    it('should mark all as viewed locally and call service', () => {
      jest
        .spyOn(notificationService, 'markAllAsViewed')
        .mockReturnValue(of(mockNotifications));
      component.notifications.set(mockNotifications);

      component.markAllAsViewed();

      expect(notificationService.markAllAsViewed).toHaveBeenCalled();
      expect(component.notifications().every((n) => n.viewed)).toBe(true);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Todas las notificaciones marcadas como leídas',
        'Cerrar',
        { duration: 3000 },
      );
    });

    it('should keep all as viewed on error', () => {
      jest
        .spyOn(notificationService, 'markAllAsViewed')
        .mockReturnValue(throwError(() => new Error('Error')));
      component.notifications.set(mockNotifications);

      component.markAllAsViewed();

      expect(notificationService.markAllAsViewed).toHaveBeenCalled();
      expect(component.notifications().every((n) => n.viewed)).toBe(true);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error al marcar todas las notificaciones como leídas',
        'Cerrar',
        { duration: 3000 },
      );
    });
  });

  describe('closeDrawer', () => {
    it('should call lateralDrawerService.close', () => {
      const spy = jest.spyOn(component['lateralDrawerService'], 'close');
      component.closeDrawer();
      expect(spy).toHaveBeenCalled();
    });
  });
});
