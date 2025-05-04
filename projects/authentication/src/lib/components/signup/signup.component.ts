import { AuthService, NavBarService } from '@Common';
import { ButtonComponent, TitleComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
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
import { Router, RouterModule } from '@angular/router';

import { Client } from '../../../../../common/src/models/client.model';
import { DocumentType } from '../../constants/documentType.enum';
import { IvaCategory } from '../../constants/ivaCategory.enum';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
const PHONE_REGEX = /^[+]?[0-9]{1,4}?[-.\\s]?([0-9]{1,3}[-.\\s]?){1,4}$/;

@Component({
  selector: 'app-signup',
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
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup<{
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
    phone: FormControl<string>;
    birthDate: FormControl<Date>;
    country: FormControl<string>;
    province: FormControl<string>;
    town: FormControl<string>;
    street: FormControl<string>;
    streetNumber: FormControl<number>;
    taxCategory: FormControl<number>;
    documentType: FormControl<string>;
    documentNumber: FormControl<string>;
    companyName: FormControl<string>;
  }>;

  isSubmitting = signal(false);
  maxDocumentLength: number | null = null;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  documentTypes = Object.values(DocumentType);
  ivaCategories = Object.values(IvaCategory);

  constructor(
    private fb: FormBuilder,
    protected authService: AuthService,
    private router: Router,
    private readonly navBarService: NavBarService,
  ) {}

  ngOnInit(): void {
    this.navBarService.hideNavBar();
    this.initForm();
  }

  private initForm() {
    this.signupForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(PASSWORD_REGEX),
          ],
        ],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
        phone: ['', [Validators.required, Validators.pattern(PHONE_REGEX)]],
        birthDate: ['', Validators.required],
        country: ['', Validators.required],
        province: ['', Validators.required],
        town: ['', Validators.required],
        street: ['', Validators.required],
        streetNumber: ['', Validators.required],
        taxCategory: ['', Validators.required],
        documentType: ['', Validators.required],
        documentNumber: ['', Validators.required],
        companyName: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator },
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

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password &&
      confirmPassword &&
      password.value === confirmPassword.value
      ? null
      : { mismatch: true };
  }

  toggleVisibility(signal: WritableSignal<boolean>): void {
    signal.set(!signal());
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isSubmitting.set(true);
      const client: Client = {
        firstName: this.signupForm.controls.firstName.value,
        lastName: this.signupForm.controls.lastName.value,
        email: this.signupForm.controls.email.value,
        password: this.signupForm.controls.password.value,
        confirmPassword: this.signupForm.controls.confirmPassword.value,
        phone: this.signupForm.controls.phone.value,
        birthDate: this.signupForm.controls.birthDate.value,
        country: this.signupForm.controls.country.value,
        province: this.signupForm.controls.province.value,
        town: this.signupForm.controls.town.value,
        street: this.signupForm.controls.street.value,
        streetNumber: this.signupForm.controls.streetNumber.value,
        taxCategory: this.signupForm.controls.taxCategory.value,
        documentType: this.signupForm.controls.documentType.value,
        documentNumber: this.signupForm.controls.documentNumber.value,
        companyName: this.signupForm.controls.companyName.value,
      };
      this.authService.signUpAsync(client).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/login']);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
    }
  }
}
