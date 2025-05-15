import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  Signal,
  signal,
} from '@angular/core';
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
  @Input() disabled: boolean = false;
  @Input() loading: Signal<boolean> = signal(false);

  @Output() onClick = new EventEmitter<void>();

  clickEvent(): void {
    if (!this.disabled) {
      this.onClick.emit();
    }
  }
}
