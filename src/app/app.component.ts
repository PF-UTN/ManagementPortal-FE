import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonUiComponent } from '@common-ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonUiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
