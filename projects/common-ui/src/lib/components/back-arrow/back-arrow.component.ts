import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'mp-back-arrow',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './back-arrow.component.html',
  styleUrl: './back-arrow.component.scss',
})
export class BackArrowComponent {
  @Input() backTo?: string;
  @Input() color?: string;

  constructor(private router: Router) {}

  goBack() {
    if (this.backTo) {
      this.router.navigate([this.backTo]);
    } else {
      window.history.back();
    }
  }
}
