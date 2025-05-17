import { AuthService, NavBarService } from '@Common';
import {
  ButtonComponent,
  SubtitleComponent,
  InfoButtonComponent,
} from '@Common-UI';

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
import { MatTooltipModule } from '@angular/material/tooltip';
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
    InfoButtonComponent,
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

  onSubmit(): void {}
}
