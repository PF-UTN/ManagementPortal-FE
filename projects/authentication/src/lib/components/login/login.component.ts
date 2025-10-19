import { AuthService, environment, NavBarService, RolesEnum } from '@Common';
import {
  ButtonComponent,
  InputComponent,
  SubtitleComponent,
  AuthTitleComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { User } from '../../../../../common/src/models/user.model';
import { customEmailValidator } from '../../validators/email.validator';

@Component({
  selector: 'mp-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    ButtonComponent,
    AuthTitleComponent,
    SubtitleComponent,
    InputComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }>;
  logoUrl = `${environment.cdnBaseUrl}/images/dog.png`;
  hidePassword = signal(true);
  errorMessage: string | null;
  isSubmitting = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly navBarService: NavBarService,
  ) {}

  ngOnInit(): void {
    this.navBarService.hideNavBar();
    this.authService.logOut();
    this.initForm();
  }

  private initForm() {
    this.loginForm = new FormGroup({
      email: new FormControl<string | null>(null, {
        validators: [Validators.required, customEmailValidator()],
      }),
      password: new FormControl<string | null>(null, {
        validators: [Validators.required],
      }),
    });
  }

  togglePasswordVisibility() {
    this.hidePassword.set(!this.hidePassword());
  }

  navigateToRegister(): void {
    this.router.navigate(['autenticacion/registro']);
  }

  navigateToResetPassword(): void {
    this.router.navigate(['autenticacion/solicitud-restablecimiento-clave']);
  }

  onSubmit(): void {
    this.isSubmitting.set(true);
    if (this.loginForm.valid) {
      const credentials: User = {
        email: this.loginForm.controls.email.value!,
        password: this.loginForm.controls.password.value!,
      };

      this.authService.logInAsync(credentials).subscribe({
        next: () => {
          const role = this.authService.userRole ?? null;
          if (role === RolesEnum.Client) {
            this.router.navigate(['/productos/cliente']);
          } else {
            this.router.navigate(['inicio']);
          }
          this.navBarService.showNavBar();
          this.isSubmitting.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error.message;
          this.isSubmitting.set(false);
        },
      });
    }
  }
}
