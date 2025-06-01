import { CommonModule, NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { ButtonTypes } from './constants/button-types';
import { ButtonType } from '../../models/button-type.model';

@Component({
  selector: 'mp-dropdown-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, NgFor],
  templateUrl: './dropdown-button.component.html',
  styleUrl: './dropdown-button.component.scss',
})
export class DropdownButtonComponent {
  @Input() type: ButtonType = ButtonTypes.primary;
  @Input() items: { label: string; action?: () => void }[] = [];
}
