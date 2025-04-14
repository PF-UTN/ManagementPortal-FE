import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ButtonComponent, TitleComponent, SubtitleComponent } from '@Common';
import { User } from '../../models/user.model';
import { ERROR_MESSAGES } from '@Common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,
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
    SubtitleComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }>;

  hidePassword = true;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup({
      email: new FormControl<string | null>(null, { validators:  [Validators.required, Validators.email]}),
      password: new FormControl<string | null>(null, { validators: [Validators.required, Validators.minLength(8)] }),
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  navigateToRegister(): void {
    this.router.navigate(['/signup']);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials: User = {
        email: this.loginForm.controls.email.value!,
        password: this.loginForm.controls.password.value!,
      };
      this.authService.logInAsync(credentials).subscribe({
        next: (response) => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          if (error.status === 401) {
            this.errorMessage = ERROR_MESSAGES.invalidCredentials;
          } else {
            this.errorMessage = ERROR_MESSAGES.unexpectedError;
          }
        }
      });
    }
  }

}