import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mp-subtitle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mp-subtitle.component.html',
  styleUrl: './mp-subtitle.component.scss'
})
export class MpSubtitleComponent {
  @Input() label: string = '';
  @Input() color: string = 'black';
  @Input() fontSize: string = '';
}
