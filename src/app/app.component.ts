import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonComponent } from '@Common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
