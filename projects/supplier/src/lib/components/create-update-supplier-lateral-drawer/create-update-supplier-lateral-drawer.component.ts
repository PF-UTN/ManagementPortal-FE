import { DocumentType, customEmailValidator } from '@Authentication';
import { TownService, Town } from '@Common';
import { LateralDrawerContainer, LateralDrawerService } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, map, Observable, startWith, switchMap } from 'rxjs';

import { Supplier } from '../../models/supplier.model';
import { SupplierService } from '../../services/supplier.service';

const PHONE_REGEX = /^[+]?\d{1,4}?[-.\s]?(\d{1,3}[-.\s]?){1,4}$/;

@Component({
  selector: 'mp-create-update-supplier-lateral-drawer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatIconButton,
    MatButtonModule,
    MatAutocompleteModule,
  ],
  templateUrl: './create-update-supplier-lateral-drawer.component.html',
  styleUrl: './create-update-supplier-lateral-drawer.component.scss',
})
export class CreateUpdateSupplierLateralDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  isLoading = signal(false);
  isDocumentCompleted = signal(false);
  isCreating = signal(false);
  isUpdating = signal(false);
  maxDocumentLength: number | null;

  supplierForm: FormGroup<{
    businessName: FormControl<string | null>;
    documentType: FormControl<string | null>;
    documentNumber: FormControl<string | null>;
    email: FormControl<string | null>;
    phone: FormControl<string | null>;
    street: FormControl<string | null>;
    streetNumber: FormControl<number | null>;
    town: FormControl<Town | null>;
  }>;

  documentTypes = Object.values(DocumentType);
  filteredTowns$: Observable<Town[]>;

  constructor(
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly fb: FormBuilder,
    private readonly supplierService: SupplierService,
    private readonly snackBar: MatSnackBar,
    protected townService: TownService,
  ) {
    super();
    effect(() => {
      const isCreating = this.isCreating();
      const isUpdating = this.isUpdating();

      const drawerConfig = {
        ...this.lateralDrawerService.config,
        title: isCreating
          ? 'Crear Proveedor'
          : isUpdating
            ? 'Editar Proveedor'
            : 'Gestionar Proveedor',
        footer: {
          firstButton: {
            click: () => this.onSubmit(),
            text: isCreating ? 'Crear' : isUpdating ? 'Modificar' : 'Confirmar',
            loading: this.isLoading(),
          },
          secondButton: {
            click: () => this.closeDrawer(),
            text: 'Cancelar',
          },
        },
      };

      this.lateralDrawerService.updateConfig(drawerConfig);
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.disableSupplierFields();
    this.setupDocumentWatcher();
    this.filteredTowns$ = this.supplierForm.controls.town.valueChanges.pipe(
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

  private initForm() {
    this.supplierForm = new FormGroup({
      businessName: new FormControl<string | null>(null, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
      documentType: new FormControl<string | null>(null, Validators.required),
      documentNumber: new FormControl<string | null>(null, Validators.required),
      email: new FormControl<string | null>(null, [
        Validators.required,
        customEmailValidator(),
      ]),
      phone: new FormControl<string | null>(null, [
        Validators.required,
        Validators.pattern(PHONE_REGEX),
        Validators.maxLength(20),
      ]),
      street: new FormControl<string | null>(null, Validators.required),
      streetNumber: new FormControl<number | null>(null, Validators.required),
      town: new FormControl<Town | null>(null, [
        Validators.required,
        this.townListValidator(),
      ]),
    });
    this.supplierForm.get('documentType')?.valueChanges.subscribe(() => {
      this.supplierForm.get('documentNumber')?.reset();
    });

    this.supplierForm.controls.documentType.valueChanges.subscribe((value) => {
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

      const docNumberControl = this.supplierForm.controls.documentNumber;
      const validators = [Validators.required];

      if (this.maxDocumentLength) {
        validators.push(Validators.maxLength(this.maxDocumentLength));
      }

      docNumberControl.setValidators(validators);
      docNumberControl.updateValueAndValidity();
    });
  }

  private disableSupplierFields() {
    this.supplierForm.controls.businessName.disable();
    this.supplierForm.controls.email.disable();
    this.supplierForm.controls.phone.disable();
    this.supplierForm.controls.street.disable();
    this.supplierForm.controls.streetNumber.disable();
    this.supplierForm.controls.town.disable();
  }

  private setupDocumentWatcher() {
    this.supplierForm.controls.documentType?.valueChanges.subscribe(() =>
      this.checkSupplierExists(),
    );
    this.supplierForm.controls.documentNumber?.valueChanges.subscribe(() =>
      this.checkSupplierExists(),
    );
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
  checkSupplierExists() {
    const documentType = this.supplierForm.controls.documentType.value;
    const documentNumber = this.supplierForm.controls.documentNumber.value;

    if (!documentType || !documentNumber) return;

    switch (documentType) {
      case DocumentType.CUIT:
        if (documentNumber.length < 11) return;
        break;
      case DocumentType.CUIL:
        if (documentNumber.length < 11) return;
        break;
      case DocumentType.DNI:
        if (documentNumber.length < 8) return;
        break;
      default:
        break;
    }

    this.supplierService
      .getSupplierByDocumentAsync(documentType, documentNumber)
      .subscribe({
        next: (supplier) => {
          if (supplier) {
            this.isUpdating.set(true);
            this.supplierForm.patchValue({
              businessName: supplier.businessName,
              email: supplier.email,
              phone: supplier.phone,
              street: supplier.address.street,
              streetNumber: supplier.address.streetNumber,
              town: supplier.address.town,
            });
            this.enableSupplierFields();
            this.supplierForm.markAsPristine();
            this.isDocumentCompleted.set(true);
          } else {
            this.isCreating.set(true);
            this.enableSupplierFields();
            this.supplierForm.patchValue({
              businessName: null,
              email: null,
              phone: null,
              street: null,
              streetNumber: null,
              town: null,
            });
          }
        },
        error: () => {
          this.isCreating.set(true);
          this.enableSupplierFields();
          this.isDocumentCompleted.set(true);
        },
      });
  }
  closeDrawer(): void {
    this.lateralDrawerService.close();
  }
  private enableSupplierFields() {
    this.supplierForm.controls.businessName.enable();
    this.supplierForm.controls.email.enable();
    this.supplierForm.controls.phone.enable();
    this.supplierForm.controls.street.enable();
    this.supplierForm.controls.streetNumber.enable();
    this.supplierForm.controls.town.enable();
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
  displayTown(town: Town | null): string {
    return town ? `${town.name} (${town.zipCode})` : '';
  }
  onSubmit() {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const supplier: Supplier = {
      businessName: this.supplierForm.controls.businessName.value!,
      documentType: this.supplierForm.controls.documentType.value!,
      documentNumber: this.supplierForm.controls.documentNumber.value!,
      email: this.supplierForm.controls.email.value!,
      phone: this.supplierForm.controls.phone.value!,
      address: {
        street: this.supplierForm.controls.street.value!,
        streetNumber: this.supplierForm.controls.streetNumber.value!,
        townId: this.supplierForm.controls.town.value!.id,
      },
    };

    this.supplierService.postCreateOrUpdateSupplierAsync(supplier).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.snackBar.open(
          'Proveedor creado/modificado correctamente',
          'Cerrar',
          {
            duration: 3000,
          },
        );
        this.closeDrawer();
        this.emitSuccess();
      },
      error: (err) => {
        console.error('Error al guardar proveedor', err);
        this.isLoading.set(false);
      },
    });
  }
}
