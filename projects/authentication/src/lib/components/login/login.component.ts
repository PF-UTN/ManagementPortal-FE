import { ERROR_MESSAGES } from '@Common';
import { ButtonComponent, SubtitleComponent, TitleComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, RouterModule } from '@angular/router';

import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatSelectModule,
    MatSlideToggleModule,
    ButtonComponent,
    TitleComponent,
    SubtitleComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }>;

  hidePassword = true;
  errorMessage: string = '';
  isSubmitting = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl<string | null>(null, {
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl<string | null>(null, {
        validators: [Validators.required, Validators.minLength(8)],
      }),
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  navigateToRegister(): void {
    this.router.navigate(['/signup']);
  }

  onKeydownEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.loginForm.invalid) {
        event.preventDefault();
        return;
      }
      this.onSubmit();
    }
  }

  onSubmit(): void {
    this.isSubmitting = true;
    if (this.loginForm.valid) {
      const credentials: User = {
        email: this.loginForm.controls.email.value!,
        password: this.loginForm.controls.password.value!,
      };
      this.authService.logInAsync(credentials).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isSubmitting = false;
          if (error.status === 401) {
            this.errorMessage = ERROR_MESSAGES.invalidCredentials;
          } else {
            this.errorMessage = ERROR_MESSAGES.unexpectedError;
          }
        },
      });
    }
  }
}
