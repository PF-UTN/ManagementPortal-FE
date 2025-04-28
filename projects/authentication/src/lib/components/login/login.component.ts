import { NavBarService } from '@Common';
import { ButtonComponent, SubtitleComponent, TitleComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
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

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }>;

  hidePassword = true;
  errorMessage: string = '';
  isSubmitting = false;
  invalidEmail = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly navBarService: NavBarService,
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.navBarService.showNavBar();
      this.router.navigate(['inicio']);
    }
    this.navBarService.hideNavBar();
    this.initForm();
  }

  private initForm() {
    this.loginForm = new FormGroup({
      email: new FormControl<string | null>(null, {
        validators: [Validators.required, this.customEmailValidator()],
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
    this.router.navigate(['signup']);
  }

  customEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isValid = EMAIL_REGEX.test(control.value);
      return isValid ? null : { invalidEmail: true };
    };
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
          this.router.navigate(['inicio']);
          this.navBarService.showNavBar();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error.message;
        },
      });
    }
  }
}
