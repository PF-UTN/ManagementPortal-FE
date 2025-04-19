import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'mp-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './title.component.html',
  styleUrl: './title.component.scss',
})
export class TitleComponent {}
