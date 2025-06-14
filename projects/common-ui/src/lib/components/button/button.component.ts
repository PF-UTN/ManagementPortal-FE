import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ButtonTypes } from './constants/button-types';
import { ButtonType } from '../../models/button-type.model';

@Component({
  selector: 'mp-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() type: ButtonType = ButtonTypes.primary;
  disabled = input(false);
  loading = input(false);

  @Output() onClick = new EventEmitter<void>();

  clickEvent(): void {
    if (!this.disabled() && !this.loading()) {
      this.onClick.emit();
    }
  }
}
