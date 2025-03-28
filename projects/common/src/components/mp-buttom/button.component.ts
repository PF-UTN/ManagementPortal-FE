import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'mp-button',
  standalone: true,
  imports: [CommonModule,
            MatButtonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})

export class ButtonComponent {
  @Input() label: string = 'Click';  
  @Input() type: 'button' | 'submit' | 'reset' = 'button'; 
  @Input() disabled: boolean = false; 

  @Output() clicked = new EventEmitter<void>(); 

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit(); 
    }
  }
}
