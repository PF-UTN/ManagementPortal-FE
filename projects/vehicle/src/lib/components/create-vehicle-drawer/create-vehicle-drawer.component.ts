import {
  InputComponent,
  LateralDrawerContainer,
  LateralDrawerService,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
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

import { VehicleCreate } from '../../models/vehicle-create.model';
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

  readonly PATENTE_REGEX = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;

  constructor(
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly vehicleService: VehicleService,
    private readonly fb: FormBuilder,
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
    this.form = this.fb.group({
      licensePlate: [
        '',
        [Validators.required, Validators.pattern(this.PATENTE_REGEX)],
      ],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      kmTraveled: [0, [Validators.required, Validators.min(0)]],
      admissionDate: [null as Date | null, Validators.required],
      enabled: [false],
      deleted: [false],
    });

    this.form.controls['licensePlate']?.valueChanges.subscribe((value) => {
      if (value && value !== value.toUpperCase()) {
        this.form.controls['licensePlate']?.setValue(value.toUpperCase(), {
          emitEvent: false,
        });
      }
    });

    this.form.valueChanges.subscribe(() => {
      this.isFormValid.set(this.form.valid);
    });
  }

  onSubmit(): void {
    this.isLoading.set(true);
    const admissionDateValue = this.form.value.admissionDate;
    const payload: VehicleCreate = {
      licensePlate: this.form.value.licensePlate ?? '',
      brand: this.form.value.brand ?? '',
      model: this.form.value.model ?? '',
      kmTraveled: this.form.value.kmTraveled ?? 0,
      admissionDate: admissionDateValue
        ? admissionDateValue instanceof Date
          ? admissionDateValue.toISOString()
          : admissionDateValue
        : new Date().toISOString(),
      enabled: this.form.value.enabled ?? false,
      deleted: this.form.value.deleted ?? false,
    };
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
          this.form.controls['licensePlate']?.setErrors({ exists: true });
        }
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        this.isLoading.set(false);
      },
    });
  }

  closeDrawer() {
    this.lateralDrawerService.close();
  }
}
