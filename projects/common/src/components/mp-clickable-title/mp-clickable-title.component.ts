import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mp-clickable-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mp-clickable-title.component.html',
  styleUrl: './mp-clickable-title.component.scss'
})
export class MpClickableTitleComponent {
  @Input() label: string = '';
  @Input() color: string = 'black';
  @Input() fontSize: string = '';
  @Output() clicked = new EventEmitter<void>(); 
  
  onClick(): void {
      this.clicked.emit(); 
  }
}
