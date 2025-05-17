import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'mp-info-button',
  standalone: true,
  imports: [MatTooltipModule, MatIcon, CommonModule, MatButtonModule],
  templateUrl: './info-button.component.html',
  styleUrl: './info-button.component.scss',
})
export class InfoButtonComponent {
  @Input() tooltipText: string = '';
}
