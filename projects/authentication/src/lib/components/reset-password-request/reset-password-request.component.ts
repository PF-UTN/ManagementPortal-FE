import { AuthService, NavBarService } from '@Common';
import {
  ButtonComponent,
  SubtitleComponent,
  BackArrowComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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
import { Router } from '@angular/router';

import { customEmailValidator } from '../../validators';

const COUNTDOWN_KEY = 'reset_password_expires_at';
const COUNTDOWN_DURATION = 60;
@Component({
  selector: 'mp-reset-password-request',
  standalone: true,
  imports: [
    CommonModule,
    SubtitleComponent,
    ButtonComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    BackArrowComponent,
  ],
  templateUrl: './reset-password-request.component.html',
  styleUrl: './reset-password-request.component.scss',
})
export class ResetPasswordRequestComponent implements OnInit {
  resetPasswordRequestForm: FormGroup<{
    email: FormControl<string | null>;
  }>;

  isSubmitting = signal(false);
  emailSent = signal(false);
  waitCountdown = signal(false);
  countdown = signal(COUNTDOWN_DURATION);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly navBarService: NavBarService,
  ) {}

  ngOnInit(): void {
    this.navBarService.hideNavBar();
    this.initForm();
    this.checkStoredCountdown();
  }

  private initForm() {
    this.resetPasswordRequestForm = new FormGroup({
      email: new FormControl<string | null>(null, [
        Validators.required,
        customEmailValidator(),
      ]),
    });
  }

  private checkStoredCountdown() {
    const expiresAtStr = localStorage.getItem(COUNTDOWN_KEY);
    if (!expiresAtStr) return;

    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Date.now();
    const secondsLeft = Math.floor((expiresAt - now) / 1000);

    if (secondsLeft > 0) {
      this.emailSent.set(true);
      this.waitCountdown.set(true);
      this.startCountdown(secondsLeft);
    } else {
      localStorage.removeItem(COUNTDOWN_KEY);
    }
  }

  private startCountdown(seconds: number) {
    this.countdown.set(seconds);

    const intervalId = setInterval(() => {
      seconds--;
      this.countdown.set(seconds);

      if (seconds === 0) {
        clearInterval(intervalId);
        this.waitCountdown.set(false);
        this.emailSent.set(false);
        localStorage.removeItem(COUNTDOWN_KEY);
      }
    }, 1000);
  }

  onSubmit() {
    this.isSubmitting.set(true);
    const email = this.resetPasswordRequestForm.controls.email.value!;
    this.authService.resetPasswordRequestAsync(email).subscribe(() => {
      this.isSubmitting.set(false);
      this.emailSent.set(true);
      this.waitCountdown.set(true);

      const expiresAt = Date.now() + COUNTDOWN_DURATION * 1000;
      localStorage.setItem(COUNTDOWN_KEY, expiresAt.toString());

      this.startCountdown(COUNTDOWN_DURATION);
    });
  }
}
