import { DocumentType, customEmailValidator } from '@Authentication';
import { TownService, Town } from '@Common';
import { LateralDrawerContainer, LateralDrawerService } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
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
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            click: () => this.onSubmit(),
            text: 'Confirmar',
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
      town: new FormControl<Town | null>(null, Validators.required),
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

  private setupDocumentWatcher() {
    this.supplierForm.controls.documentType?.valueChanges.subscribe(() =>
      this.checkSupplierExists(),
    );
    this.supplierForm.controls.documentNumber?.valueChanges.subscribe(() =>
      this.checkSupplierExists(),
    );
  }

  checkSupplierExists() {
    const documentType = this.supplierForm.controls.documentType?.value;
    const documentNumber = this.supplierForm.controls.documentNumber?.value;

    if (!documentType || !documentNumber) return;

    this.supplierService
      .getSupplierByDocumentAsync(documentType, documentNumber)
      .subscribe({
        next: (supplier) => {
          if (supplier) {
            this.supplierForm.patchValue({
              businessName: supplier.businessName,
              email: supplier.email,
              phone: supplier.phone,
              street: supplier.address.street,
              streetNumber: supplier.address.streetNumber,
              town: supplier.address.town,
            });
          }
        },
      });
  }

  closeDrawer(): void {
    this.lateralDrawerService.close();
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
