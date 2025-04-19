import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { ButtonType } from './model/button-type.constant';
import { ButtonTypeEnum } from './model/button-types.model';

@Component({
  selector: 'mp-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() type: ButtonType = ButtonTypeEnum.primary;
  @Input() disabled: boolean = false;

  @Output() onClick = new EventEmitter<void>();

  clickEvent(): void {
    if (!this.disabled) {
      this.onClick.emit();
    }
  }
}
