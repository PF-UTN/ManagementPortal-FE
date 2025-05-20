import { AuthService, NavBarService } from '@Common';
import { ButtonComponent, TitleComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';

import { Client } from '../../../../../common/src/models/client.model';
import { PASSWORD_REGEX } from '../../constants';
import { DocumentType } from '../../constants/documentType.enum';
import { IvaCategory } from '../../constants/ivaCategory.enum';
import { customEmailValidator } from '../../validators';
import { matchPasswords } from '../../validators';

const PHONE_REGEX = /^[+]?[0-9]{1,4}?[-.\\s]?([0-9]{1,3}[-.\\s]?){1,4}$/;

@Component({
  selector: 'mp-signup',
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
    MatSnackBarModule,
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup<{
    firstName: FormControl<string | null>;
    lastName: FormControl<string | null>;
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
    phone: FormControl<string | null>;
    birthDate: FormControl<Date | null>;
    town: FormControl<string | null>;
    street: FormControl<string | null>;
    streetNumber: FormControl<number | null>;
    taxCategory: FormControl<number | null>;
    documentType: FormControl<string | null>;
    documentNumber: FormControl<string | null>;
    companyName: FormControl<string | null>;
  }>;

  isSubmitting = signal(false);
  maxDocumentLength: number | null;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  documentTypes = Object.values(DocumentType);
  ivaCategories = Object.values(IvaCategory);
  errorMessage: string | null;

  constructor(
    private fb: FormBuilder,
    protected authService: AuthService,
    private router: Router,
    private readonly navBarService: NavBarService,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.navBarService.hideNavBar();
    this.initForm();
  }

  private initForm() {
    this.signupForm = new FormGroup(
      {
        firstName: new FormControl<string | null>(null, [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ]),
        lastName: new FormControl<string | null>(null, [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ]),
        email: new FormControl<string | null>(null, [
          Validators.required,
          customEmailValidator(),
        ]),
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
        phone: new FormControl<string | null>(null, [
          Validators.required,
          Validators.pattern(PHONE_REGEX),
          Validators.maxLength(20),
        ]),
        birthDate: new FormControl<Date | null>(null, Validators.required),
        town: new FormControl<string | null>(null, Validators.required),
        street: new FormControl<string | null>(null, Validators.required),
        streetNumber: new FormControl<number | null>(null, Validators.required),
        taxCategory: new FormControl<number | null>(null, Validators.required),
        documentType: new FormControl<string | null>(null, Validators.required),
        documentNumber: new FormControl<string | null>(
          null,
          Validators.required,
        ),
        companyName: new FormControl<string | null>(null, Validators.required),
      },
      { validators: matchPasswords('password', 'confirmPassword') },
    );

    this.signupForm.get('documentType')?.valueChanges.subscribe(() => {
      this.signupForm.get('documentNumber')?.reset();
    });

    this.signupForm.controls.documentType.valueChanges.subscribe((value) => {
      switch (value) {
        case DocumentType.CUIT:
          this.maxDocumentLength = 11;
          break;
        case DocumentType.CUIL:
          this.maxDocumentLength = 11;
          break;
        case DocumentType.DNI:
          this.maxDocumentLength = 8;
          break;
        default:
          this.maxDocumentLength = null;
      }

      const docNumberControl = this.signupForm.controls.documentNumber;
      const validators = [Validators.required];

      if (this.maxDocumentLength) {
        validators.push(Validators.maxLength(this.maxDocumentLength));
      }

      docNumberControl.setValidators(validators);
      docNumberControl.updateValueAndValidity();
    });
  }

  preventNonNumericInput(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (
      allowedKeys.includes(event.key) ||
      (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))
    ) {
      return;
    }

    const isNumber = /^[0-9]$/.test(event.key);
    if (!isNumber) {
      event.preventDefault();
    }
  }

  toggleVisibility(signal: WritableSignal<boolean>): void {
    signal.set(!signal());
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isSubmitting.set(true);
      const client: Client = {
        firstName: this.signupForm.controls.firstName.value!,
        lastName: this.signupForm.controls.lastName.value!,
        email: this.signupForm.controls.email.value!,
        password: this.signupForm.controls.password.value!,
        confirmPassword: this.signupForm.controls.confirmPassword.value!,
        phone: this.signupForm.controls.phone.value!,
        birthDate: this.signupForm.controls.birthDate.value!,
        town: this.signupForm.controls.town.value!,
        street: this.signupForm.controls.street.value!,
        streetNumber: this.signupForm.controls.streetNumber.value!,
        taxCategory: this.signupForm.controls.taxCategory.value!,
        documentType: this.signupForm.controls.documentType.value!,
        documentNumber: this.signupForm.controls.documentNumber.value!,
        companyName: this.signupForm.controls.companyName.value!,
      };
      this.authService.signUpAsync(client).subscribe({
        next: () => {
          void this.router.navigate(['/login']);
          this.snackBar.open(
            'Solicitud de registro enviada con éxito.',
            'Cerrar',
            {
              duration: 3000,
            },
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error.message;
          this.isSubmitting.set(false);
        },
        complete: () => {
          this.isSubmitting.set(false);
        },
      });
    }
  }
}
