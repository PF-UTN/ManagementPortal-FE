import { AuthService, RolesEnum } from '@Common';
import { CartBadgeButtonComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'mp-nav-bar-horizontal',
  standalone: true,
  imports: [CartBadgeButtonComponent, CommonModule],
  templateUrl: './nav-bar-horizontal.component.html',
  styleUrl: './nav-bar-horizontal.component.scss',
})
export class NavBarHorizontalComponent {
  cartCount = 0;

  constructor(private authService: AuthService) {}

  get shouldRender(): boolean {
    return this.authService.hasAccess([RolesEnum.Client, RolesEnum.Admin]);
  }
}
