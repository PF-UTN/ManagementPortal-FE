import { TownService, Town, VehicleService } from '@Common';
import {
  InputComponent,
  LateralDrawerContainer,
  LateralDrawerService,
  LoadingComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal, Input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, map, Observable, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'lib-create-update-supplier-service-drawer',
  standalone: true,
  imports: [
    LoadingComponent,
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  templateUrl: './create-update-supplier-service-drawer.component.html',
  styleUrl: './create-update-supplier-service-drawer.component.scss',
})
export class CreateUpdateSupplierServiceDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  @Input() supplier?: {
    id: number;
    businessName: string;
    documentType: string;
    documentNumber: string;
    email: string;
    phone: string;
    address: {
      street: string;
      streetNumber: number;
      townId: number;
    };
  };

  isLoading = signal(false);
  isUpdating = signal(false);
  isFormValid = signal(false);
  filteredTowns$: Observable<Town[]>;

  form: FormGroup<{
    businessName: FormControl<string | null>;
    documentType: FormControl<string | null>;
    documentNumber: FormControl<string | null>;
    email: FormControl<string | null>;
    phone: FormControl<string | null>;
    street: FormControl<string | null>;
    streetNumber: FormControl<number | null>;
    town: FormControl<Town | null>;
  }>;

  constructor(
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly snackBar: MatSnackBar,
    private readonly townService: TownService,
    private readonly vehicleService: VehicleService,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        title: this.isUpdating() ? 'Editar proveedor' : 'Crear proveedor',
        footer: {
          firstButton: {
            click: () => this.onSubmit(),
            text: this.isUpdating() ? 'Modificar' : 'Crear',
            loading: this.isLoading(),
            disabled: !this.isFormValid(),
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
    this.isUpdating.set(false);

    this.form.controls.documentType.valueChanges.subscribe(() =>
      this.tryFetchSupplier(),
    );
    this.form.controls.documentNumber.valueChanges.subscribe(() =>
      this.tryFetchSupplier(),
    );

    this.filteredTowns$ = this.form.controls.town.valueChanges.pipe(
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
    this.form = new FormGroup({
      businessName: new FormControl<string | null>(null, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(255),
      ]),
      documentType: new FormControl<string | null>(null, [
        Validators.required,
        Validators.maxLength(20),
      ]),
      documentNumber: new FormControl<string | null>(null, [
        Validators.required,
        Validators.maxLength(20),
      ]),
      email: new FormControl<string | null>(null, [
        Validators.required,
        Validators.email,
        Validators.maxLength(255),
      ]),
      phone: new FormControl<string | null>(null, [
        Validators.required,
        Validators.maxLength(20),
      ]),
      street: new FormControl<string | null>(null, [
        Validators.required,
        Validators.maxLength(255),
      ]),
      streetNumber: new FormControl<number | null>(null, [Validators.required]),
      town: new FormControl<Town | null>(null, [
        Validators.required,
        this.townListValidator(),
      ]),
    });
    this.form.controls.businessName.disable();
    this.form.controls.email.disable();
    this.form.controls.phone.disable();
    this.form.controls.street.disable();
    this.form.controls.streetNumber.disable();
    this.form.controls.town.disable();
    this.form.valueChanges.subscribe(() =>
      this.isFormValid.set(this.form.valid),
    );
  }

  closeDrawer(): void {
    this.lateralDrawerService.close();
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

  displayTown(town: Town | string | null): string {
    if (typeof town === 'string') {
      return town;
    }
    return town ? `${town.name} (${town.zipCode})` : '';
  }

  public tryFetchSupplier() {
    if (
      this.form.controls.documentType.disabled ||
      this.form.controls.documentNumber.disabled
    ) {
      return;
    }

    const documentType = this.form.controls.documentType.value;
    const documentNumber = this.form.controls.documentNumber.value;

    if (!documentType || !documentNumber) return;

    const requiredLength = documentType === 'DNI' ? 8 : 11;
    if (documentNumber.length < requiredLength) return;

    this.isLoading.set(true);

    this.vehicleService
      .getServiceSupplierByDocument(documentType, documentNumber)
      .subscribe((supplier) => {
        if (supplier) {
          this.isUpdating.set(true);
          this.form.patchValue(
            {
              businessName: supplier.businessName,
              email: supplier.email,
              phone: supplier.phone,
              street: supplier.address?.street,
              streetNumber: supplier.address?.streetNumber,
              town: supplier.address?.town,
              documentType: supplier.documentType?.toUpperCase().trim(),
              documentNumber: String(supplier.documentNumber).replace(
                /\D/g,
                '',
              ),
            },
            { emitEvent: false },
          );
          this.enableSupplierFields();
          this.form.controls.documentType.disable();
          this.form.controls.documentNumber.disable();
        } else {
          this.isUpdating.set(false);
          this.enableSupplierFields();
          this.form.patchValue(
            {
              businessName: null,
              email: null,
              phone: null,
              street: null,
              streetNumber: null,
              town: null,
            },
            { emitEvent: false },
          );
        }
        this.isLoading.set(false);
      });
  }

  public enableSupplierFields() {
    this.form.controls.businessName.enable();
    this.form.controls.email.enable();
    this.form.controls.phone.enable();
    this.form.controls.street.enable();
    this.form.controls.streetNumber.enable();
    this.form.controls.town.enable();
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading.set(true);

    const formValue = this.form.value;
    const documentType = String(this.form.controls.documentType.value)
      .trim()
      .toUpperCase();
    const documentNumber = String(
      this.form.controls.documentNumber.value,
    ).replace(/\D/g, '');

    const request = {
      businessName: formValue.businessName!,
      documentType,
      documentNumber,
      email: formValue.email!,
      phone: formValue.phone!,
      address: {
        street: formValue.street!,
        streetNumber: formValue.streetNumber!,
        townId: formValue.town!.id,
      },
    };

    this.vehicleService.createServiceSupplier(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.snackBar.open(
          this.isUpdating()
            ? 'Proveedor modificado correctamente'
            : 'Proveedor creado correctamente',
          'Cerrar',
          { duration: 3000 },
        );
        this.emitSuccess();
        this.closeDrawer();
      },
      error: (err) => {
        this.isLoading.set(false);
        if (
          err?.status === 409 ||
          (err?.error?.message && err.error.message.includes('document'))
        ) {
          this.form.controls.documentNumber.setErrors({ documentExists: true });
          this.snackBar.open(
            'Este documento ya se encuentra registrado.',
            'Cerrar',
            { duration: 4000 },
          );
        } else if (err?.status === 400 && Array.isArray(err.error?.message)) {
          this.snackBar.open(err.error.message.join('\n'), 'Cerrar', {
            duration: 5000,
          });
        } else {
          this.snackBar.open(
            'Ocurrió un error al guardar el proveedor',
            'Cerrar',
            { duration: 3000 },
          );
        }
      },
    });
  }
}
