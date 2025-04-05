import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonUiComponent } from '@common-ui';
import { RegistrationRequestListComponent } from './components/registration-request-list/registration-request-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonUiComponent, RegistrationRequestListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
