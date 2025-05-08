import { AuthService, NavBarService } from '@Common';
import { ButtonComponent, SubtitleComponent } from '@Common-UI';

import { Component, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { customEmailValidator } from '../../validators';

@Component({
  selector: 'app-reset-password-request',
  standalone: true,
  imports: [
    SubtitleComponent,
    ButtonComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './reset-password-request.component.html',
  styleUrl: './reset-password-request.component.scss',
})
export class ResetPasswordRequestComponent implements OnInit {
  resetPasswordRequestForm: FormGroup<{
    email: FormControl<string | null>;
  }>;

  isSubmitting = signal(false);

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
    this.resetPasswordRequestForm = new FormGroup({
      email: new FormControl<string | null>(null, [
        Validators.required,
        customEmailValidator(),
      ]),
    });
  }

  onSubmit() {
    if (this.resetPasswordRequestForm.valid) {
      this.isSubmitting.set(true);
      const email = this.resetPasswordRequestForm.controls.email.value!;

      this.authService
        .resetPasswordAsync(email)
        .pipe(finalize(() => this.isSubmitting.set(false)))
        .subscribe({
          next: () => {
            this.router.navigate(['login']);
          },
        });
    }
  }
}
