import { BackArrowComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'mp-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BackArrowComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(public router: Router) {}

  get showBackArrow(): boolean {
    return !this.router.url.endsWith('/inicio-sesion');
  }
}
