import { ButtonComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'mp-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="unauthorized-container">
      <img
        src="https://cdn-icons-png.flaticon.com/512/1828/1828843.png"
        alt="Unauthorized"
        class="unauthorized-image"
      />
      <h2>Alto ahí, usted no tiene permiso para acceder a esta pagina.</h2>
      <mp-button (click)="goHome()">Ir a la HomePage</mp-button>
    </div>
  `,
  styles: [
    `
      .unauthorized-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        padding: 20px;
      }

      .unauthorized-image {
        width: 150px;
        margin-bottom: 20px;
      }

      button {
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
      }
    `,
  ],
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/inicio']);
  }
}
