import {
  InputComponent,
  LateralDrawerContainer,
  LateralDrawerService,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal, Input } from '@angular/core';
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import {
  provideNativeDateAdapter,
  MatNativeDateModule,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

import { VehicleListItem } from '../../models/vehicle-item.model';
import { VehicleService } from '../../services/vehicle.service';
@Component({
  selector: 'mp-create-vehicle-drawer',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatNativeDateModule,
    MatIconModule,
    MatIconButton,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-vehicle-drawer.component.html',
  styleUrl: './create-vehicle-drawer.component.scss',
})
export class CreateVehicleDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  form: FormGroup<{
    licensePlate: FormControl<string | null>;
    brand: FormControl<string | null>;
    model: FormControl<string | null>;
    kmTraveled: FormControl<number | null>;
    admissionDate: FormControl<Date | null>;
    enabled: FormControl<boolean | null>;
    deleted: FormControl<boolean | null>;
  }>;

  isFormValid = signal(false);
  isLoading = signal(false);

  @Input() data?: VehicleListItem;

  readonly PATENTE_REGEX = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;

  constructor(
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly vehicleService: VehicleService,
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            text: 'Guardar',
            click: () => this.onSubmit(),
            disabled: !this.isFormValid(),
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
    this.form = new FormGroup({
      licensePlate: new FormControl<string | null>(null, [
        Validators.required,
        Validators.pattern(this.PATENTE_REGEX),
      ]),
      brand: new FormControl<string | null>(null, Validators.required),
      model: new FormControl<string | null>(null, Validators.required),
      kmTraveled: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(0),
      ]),
      admissionDate: new FormControl<Date | null>(null, [
        Validators.required,
        this.admissionDateYearValidator(),
      ]),
      enabled: new FormControl<boolean | null>(null),
      deleted: new FormControl<boolean | null>(null),
    });

    this.form.controls.licensePlate.valueChanges.subscribe((value) => {
      if (value && value !== value.toUpperCase()) {
        this.form.controls.licensePlate.setValue(value.toUpperCase(), {
          emitEvent: false,
        });
      }
    });

    this.form.valueChanges.subscribe(() => {
      this.isFormValid.set(this.form.valid);
    });

    if (this.data) {
      this.form.patchValue({
        licensePlate: this.data.licensePlate,
        brand: this.data.brand,
        model: this.data.model,
        kmTraveled: this.data.kmTraveled,
        admissionDate: this.data.admissionDate
          ? new Date(this.data.admissionDate)
          : null,
        enabled: this.data.enabled ?? false,
      });
      this.form.controls.licensePlate?.disable();
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);

    const admissionDateValue = this.form.value.admissionDate;
    const payload = {
      licensePlate: this.form.controls.licensePlate?.getRawValue() ?? '',
      brand: this.form.value.brand ?? '',
      model: this.form.value.model ?? '',
      kmTraveled: this.form.value.kmTraveled ?? 0,
      admissionDate: admissionDateValue
        ? admissionDateValue instanceof Date
          ? admissionDateValue.toISOString().split('T')[0]
          : admissionDateValue
        : new Date().toISOString().split('T')[0],
      enabled: this.form.value.enabled ?? false,
      deleted: this.form.value.deleted ?? false,
    };

    if (this.data && this.data.id) {
      const updatePayload = {
        brand: payload.brand,
        model: payload.model,
        kmTraveled: payload.kmTraveled,
        admissionDate: payload.admissionDate,
        enabled: payload.enabled,
      };
      this.vehicleService
        .updateVehicleAsync(this.data.id, updatePayload)
        .subscribe({
          next: () => {
            this.emitSuccess();
            this.closeDrawer();
            this.snackBar.open('Vehículo actualizado correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.isLoading.set(false);
          },
          error: () => {
            this.snackBar.open('Error al actualizar el vehículo.', 'Cerrar', {
              duration: 5000,
            });
            this.isLoading.set(false);
          },
        });
    } else {
      this.vehicleService.createVehicleAsync(payload).subscribe({
        next: () => {
          this.emitSuccess();
          this.closeDrawer();
          this.snackBar.open('Vehículo creado correctamente', 'Cerrar', {
            duration: 3000,
          });
          this.isLoading.set(false);
        },
        error: (err) => {
          let msg = 'Error al crear el vehículo.';
          if (err?.error?.message?.includes('license plate')) {
            msg = 'Ya existe un vehículo con esa patente.';
            this.form.controls.licensePlate.setErrors({ exists: true });
          }
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
          this.isLoading.set(false);
        },
      });
    }
  }

  closeDrawer() {
    this.lateralDrawerService.close();
  }

  admissionDateYearValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value instanceof Date && value.getFullYear() > 9999) {
        return { maxYear: true };
      }
      return null;
    };
  }
}
