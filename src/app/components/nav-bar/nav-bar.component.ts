import { AuthService, RolesEnum } from '@Common';
import { ModalComponent, ModalConfig } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { NavBarItem } from '../../models/nav-bar-item.model';
@Component({
  selector: 'mp-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, MatButtonModule],
})
export class NavBarComponent implements OnInit {
  items: NavBarItem[];
  isOpen = true;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.items = [
      {
        title: 'Inicio',
        icon: 'home',
        route: 'inicio',
        shouldRender: true,
      },
      {
        title: 'Solicitudes de Registro',
        icon: 'app_registration',
        route: 'solicitudes-registro',
        shouldRender: this.authService.hasAccess([RolesEnum.Employee]),
      },
      {
        title: 'Productos',
        icon: 'inventory_2',
        route: 'productos',
        shouldRender: this.authService.hasAccess([RolesEnum.Employee]),
      },
    ];
  }

  handleLogOutClick() {
    const config: ModalConfig = {
      title: 'Confirmar cierre de sesión',
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
}
