import { AuthService, TownService, NavBarService } from '@Common';
import { ButtonComponent, InputComponent, TitleComponent } from '@Common-UI';

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
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
import { Observable, finalize } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';

import { Client } from '../../../../../common/src/models/client.model';
import { Town } from '../../../../../common/src/models/town.model';
import { PASSWORD_REGEX } from '../../constants';
import { DocumentType } from '../../constants/documentType.enum';
import { IvaCategory } from '../../constants/ivaCategory.enum';
import { customEmailValidator, matchPasswords } from '../../validators';

const PHONE_REGEX = /^[+]?\d{1,4}?[-.\s]?(\d{1,3}[-.\s]?){1,4}$/;

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
    MatAutocompleteModule,
    InputComponent,
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
    birthdate: FormControl<Date | null>;
    town: FormControl<Town | null>;
    street: FormControl<string | null>;
    streetNumber: FormControl<number | null>;
    taxCategory: FormControl<number | null>;
    documentType: FormControl<string | null>;
    documentNumber: FormControl<string | null>;
    companyName: FormControl<string | null>;
  }>;

  ivaCategories = [
    { id: 1, name: IvaCategory.ResponsableInscripto },
    { id: 2, name: IvaCategory.Exento },
    { id: 3, name: IvaCategory.Monotributo },
    { id: 4, name: IvaCategory.ConsumidorFinal },
  ];

  filteredTowns$: Observable<Town[]>;

  isSubmitting = signal(false);
  maxDocumentLength: number | null;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  documentTypes = Object.values(DocumentType);
  errorMessage: string | null;

  constructor(
    private readonly fb: FormBuilder,
    protected authService: AuthService,
    protected townService: TownService,
    private readonly router: Router,
    private readonly navBarService: NavBarService,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.navBarService.hideNavBar();
    this.initForm();
    this.filteredTowns$ = this.signupForm.controls.town.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((value) => (typeof value === 'string' ? value : (value?.name ?? ''))),
      switchMap((query) =>
        this.townService
          .searchTowns({
            searchText: query,
            page: 1,
            pageSize: 5,
          })
          .pipe(map((response) => response.results)),
      ),
    );
  }

  private translateErrorMessage(message: string): string {
    if (
      message?.includes(
        'documentNumber must be longer than or equal to 7 characters',
      )
    ) {
      return 'El número de documento debe tener al menos 7 caracteres';
    }
    return message;
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
        birthdate: new FormControl<Date | null>(null, Validators.required),
        town: new FormControl<Town | null>(null, [
          Validators.required,
          this.townListValidator(),
        ]),
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

    const isNumber = /^\d$/.test(event.key);
    if (!isNumber) {
      event.preventDefault();
    }
  }

  toggleVisibility(signal: WritableSignal<boolean>): void {
    signal.set(!signal());
  }

  displayTown(town: Town | string | null): string {
    if (typeof town === 'string') {
      return town;
    }

    if (town) {
      return `${town.name} (${town.zipCode})`;
    }

    return '';
  }

  townListValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value || typeof value !== 'object' || !('id' in value)) {
        return { invalidTown: true };
      }
      return null;
    };
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isSubmitting.set(true);

      const client: Client = {
        firstName: this.signupForm.controls.firstName.value!,
        lastName: this.signupForm.controls.lastName.value!,
        email: this.signupForm.controls.email.value!,
        password: this.signupForm.controls.password.value!,
        phone: this.signupForm.controls.phone.value!,
        birthdate: this.signupForm.controls.birthdate.value!,
        taxCategoryId: this.signupForm.controls.taxCategory.value!,
        documentType: this.signupForm.controls.documentType.value!,
        documentNumber: this.signupForm.controls.documentNumber.value!,
        companyName: this.signupForm.controls.companyName.value!,
        address: {
          street: this.signupForm.controls.street.value!,
          streetNumber: this.signupForm.controls.streetNumber.value!,
          townId: this.signupForm.controls.town.value!.id,
        },
      };
      this.authService
        .signUpAsync(client)
        .pipe(
          finalize(() => {
            this.isSubmitting.set(false);
          }),
        )
        .subscribe({
          next: () => {
            void this.router.navigate(['autenticacion/inicio-sesion']);
            this.snackBar.open(
              'Solicitud de registro enviada con éxito. Recibirás un email con los pasos a seguir.',
              'Cerrar',
              {
                duration: 5000,
              },
            );
          },
          error: (error: HttpErrorResponse) => {
            const errMessage = error.error?.message ?? error.message;
            this.errorMessage = this.translateErrorMessage(errMessage);
          },
        });
    }
  }
}
