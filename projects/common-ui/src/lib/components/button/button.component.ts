import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ButtonTypes } from './constants/button-types';
import { ButtonType } from '../../models/button-type.model';

@Component({
  selector: 'mp-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() type: ButtonType = ButtonTypes.primary;
  @Input() icon = false;
  @Input() tooltip: string = '';
  @Input() tooltipPosition: 'above' | 'below' | 'left' | 'right' = 'above';
  @Input() ariaLabel: string = '';
  disabled = input(false);
  loading = input(false);

  @Output() onClick = new EventEmitter<void>();

  clickEvent(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.disabled() && !this.loading()) {
      this.onClick.emit();
    }
  }
}
