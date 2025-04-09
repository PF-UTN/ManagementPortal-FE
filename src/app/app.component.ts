import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegistrationRequestListComponent } from './components/registration-request-list/registration-request-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RegistrationRequestListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
