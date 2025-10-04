import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { MatBadgeModule, MatBadgePosition } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';
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
    MatBadgeModule,
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() type: ButtonType = ButtonTypes.primary;
  @Input() icon: string = 'close';
  @Input() tooltip: string = '';
  @Input() tooltipPosition: 'above' | 'below' | 'left' | 'right' = 'above';
  @Input() ariaLabel: string = '';
  @Input() badge: number | null = null;
  @Input() badgeColor: ThemePalette = 'accent';
  @Input() badgeOverlap: boolean = false;
  @Input() badgePosition: MatBadgePosition = 'above after';
  disabled = input(false);
  loading = input(false);

  BUTTON_TYPES = ButtonTypes;

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
