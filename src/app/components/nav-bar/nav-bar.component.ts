import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { NavBarItem } from '../../models/nav-bar-item.model';

@Component({
  selector: 'mp-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
})
export class NavBarComponent {
  items: NavBarItem[] = [
    {
      title: 'Solicitudes de Registro',
      icon: 'app_registration',
      route: 'solicitudes-registro',
    },
  ];
}
