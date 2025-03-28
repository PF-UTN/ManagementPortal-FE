import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mp-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mp-title.component.html',
  styleUrl: './mp-title.component.scss'
})
export class MpTitleComponent {
  @Input() label: string = ''; 
  @Input() color: string = 'black';
  @Input() fontSize: string = '';
}
