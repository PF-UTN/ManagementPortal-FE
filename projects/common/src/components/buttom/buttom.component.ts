import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'mp-buttom',
  standalone: true,
  imports: [CommonModule,
            MatButtonModule],
  templateUrl: './buttom.component.html',
  styleUrl: './buttom.component.css'
})

export class ButtomComponent {
  @Input() label: string = 'Click';  
  @Input() type: 'button' | 'submit' | 'reset' = 'button'; 
  @Input() color: 'primary' | 'secondary' | 'danger' = 'primary'; 
  @Input() size: 'small' | 'medium' | 'large' = 'medium'; 
  @Input() disabled: boolean = false; 

  @Output() clicked = new EventEmitter<void>(); 

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit(); 
    }
  }
}
