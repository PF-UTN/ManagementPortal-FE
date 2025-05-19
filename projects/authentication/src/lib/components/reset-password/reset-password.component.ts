import { AuthService, NavBarService } from '@Common';
import { ButtonComponent, SubtitleComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { PASSWORD_REGEX } from '../../constants';
import { matchPasswords } from '../../validators';

@Component({
  selector: 'mp-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    SubtitleComponent,
    ButtonComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup<{
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>;

  isSubmitting = signal(false);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly navBarService: NavBarService,
    private route: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.navBarService.hideNavBar();
    this.initForm();
  }

  private initForm() {
    this.resetPasswordForm = new FormGroup(
      {
        password: new FormControl<string | null>(null, [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(PASSWORD_REGEX),
          Validators.maxLength(255),
        ]),
        confirmPassword: new FormControl<string | null>(null, [
          Validators.required,
          Validators.minLength(8),
        ]),
      },
      { validators: matchPasswords('password', 'confirmPassword') },
    );
  }

  toggleVisibility(signal: WritableSignal<boolean>): void {
    signal.set(!signal());
  }

  onSubmit(): void {
    this.isSubmitting.set(true);
    const password = this.resetPasswordForm.controls.password.value!;
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.isSubmitting.set(false);
      return;
    }
    this.authService.resetPasswordAsync(token, password).subscribe({
      next: () => {
        void this.router.navigate(['/login']);
        this.snackBar.open('Contraseña restablecida con éxito.', 'Cerrar', {
          duration: 3000,
        });
      },
      error: () => {
        this.snackBar.open('Error al restablecer la contraseña.', 'Cerrar', {
          duration: 3000,
        });
      },
      complete: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
