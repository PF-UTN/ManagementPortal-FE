import { AuthService, environment, RolesEnum } from '@Common';
import {
  ButtonComponent,
  EllipsisTextComponent,
  LateralDrawerService,
  ModalComponent,
  ModalConfig,
} from '@Common-UI';
import {
  NotificationService,
  LateralDrawerNotificationsComponent,
} from '@Notification';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { NavBarItem } from '../../models/nav-bar-item.model';
@Component({
  selector: 'mp-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    MatButtonModule,
    EllipsisTextComponent,
    ButtonComponent,
  ],
})
export class NavBarComponent implements OnInit {
  items: NavBarItem[];
  isOpen = true;
  canSeeNotifications = false;
  userName: string;
  notificationsCount = 0;
  private notifSub?: Subscription;
  private notifIntervalSub?: Subscription;
  logoUrl = `${environment.cdnBaseUrl}/images/dog.png`;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private lateralDrawerService: LateralDrawerService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.canSeeNotifications = this.authService.hasAccess([
      RolesEnum.Employee,
      RolesEnum.Admin,
    ]);
    this.userName = this.authService.userName;
    this.items = [
      {
        title: 'Inicio',
        icon: 'home',
        route: 'inicio',
        shouldRender: this.authService.hasAccess([RolesEnum.Employee]),
      },
      {
        title: 'Solicitudes de Registro',
        icon: 'app_registration',
        route: 'solicitudes-registro',
        shouldRender: this.authService.hasAccess([RolesEnum.Employee]),
      },
      {
        title: 'Inventario',
        icon: 'inventory_2',
        route: 'productos',
        shouldRender: this.authService.hasAccess([RolesEnum.Employee]),
      },
      {
        title: 'Órdenes de Compra',
        icon: 'shopping_bag',
        route: 'ordenes-compra',
        shouldRender: this.authService.hasAccess([RolesEnum.Employee]),
      },
      {
        title: 'Productos',
        icon: 'storefront',
        route: 'productos/cliente',
        shouldRender: this.authService.hasAccess([
          RolesEnum.Employee,
          RolesEnum.Client,
        ]),
      },
      {
        title: 'Vehiculos',
        icon: 'directions_car',
        route: 'vehiculos',
        shouldRender: this.authService.hasAccess([RolesEnum.Employee]),
      },
      {
        title: 'Mis pedidos',
        icon: 'assignment',
        route: 'pedidos/cliente',
        shouldRender: this.authService.hasAccess([RolesEnum.Client]),
      },
      {
        title: 'Pedidos',
        icon: 'assignment',
        route: 'pedidos',
        shouldRender: this.authService.hasAccess([RolesEnum.Employee]),
      },
      {
        title: 'Envios',
        icon: 'local_shipping',
        route: 'envios',
        shouldRender: this.authService.hasAccess([RolesEnum.Employee]),
      },
    ];
    this.subscribeToNotifications();
  }

  handleLogOutClick() {
    const config: ModalConfig = {
      title: 'CONFIRMAR CIERRE DE SESIÓN',
      message: '¿Estás seguro que deseas cerrar sesión?',
      confirmText: 'Sí',
      cancelText: 'No',
    };

    const dialogRef = this.dialog.open(ModalComponent, {
      data: config,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.logOut();
      }
    });
  }

  toggleNavBar() {
    this.isOpen = !this.isOpen;
  }
  openNotifications(): void {
    this.lateralDrawerService.open(
      LateralDrawerNotificationsComponent,
      {},
      {
        title: 'Notificaciones',
        footer: {
          firstButton: {
            text: 'Cerrar',
            click: () => this.lateralDrawerService.close(),
          },
        },
        size: 'medium',
      },
    );
  }

  private subscribeToNotifications(): void {
    this.notifSub = this.notificationService.unreadCount$.subscribe((count) => {
      this.notificationsCount = count;
    });
    this.notificationService.getNotifications().subscribe();
    this.notifIntervalSub = interval(21_600_000).subscribe(() => {
      this.notificationService.getNotifications().subscribe();
    });
  }
  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
    this.notifIntervalSub?.unsubscribe();
  }
}
