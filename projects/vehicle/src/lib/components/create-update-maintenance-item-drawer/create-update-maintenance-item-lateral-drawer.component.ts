import { VehicleService } from '@Common';
import {
  InputComponent,
  LateralDrawerContainer,
  LateralDrawerService,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MaintenanceItemSearchResult } from '../../../../../common/src/models/vehicle/maintenance-item-response.model';

@Component({
  selector: 'mp-create-update-product-category-lateral-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './create-update-maintenance-item-lateral-drawer.component.html',
})
export class CreateUpdateMaintenanceItemLateralDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  isLoading = signal(false);
  isUpdating = signal(false);
  isFormValid = signal(false);

  maintenanceItem?: MaintenanceItemSearchResult;

  form: FormGroup<{
    description: FormControl<string | null>;
  }>;

  constructor(
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly vehicleService: VehicleService,
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        title: this.isUpdating()
          ? 'Editar Ítem de Mantenimiento'
          : 'Crear Ítem de Mantenimiento',
        footer: {
          firstButton: {
            click: () => this.onSubmit(),
            text: this.isUpdating() ? 'Editar' : 'Crear',
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

    this.isUpdating.set(this.maintenanceItem != null);
  }

  private initForm() {
    this.form = new FormGroup({
      description: new FormControl<string | null>(
        this.maintenanceItem?.description ?? null,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(255),
        ],
      ),
    });

    this.form.valueChanges.subscribe(() =>
      this.isFormValid.set(this.form.valid),
    );
  }

  closeDrawer(): void {
    this.lateralDrawerService.close();
  }
  onSubmit() {
    this.isLoading.set(true);

    const request = { description: this.form.controls.description.value! };

    const service =
      this.maintenanceItem == null
        ? this.vehicleService.postCreateMaintenanceItemAsync(request)
        : this.vehicleService.putUpdateMaintenanceItemAsync(
            this.maintenanceItem.id,
            request,
          );

    service.subscribe(() => {
      this.isLoading.set(false);
      this.snackBar.open(
        this.isUpdating()
          ? 'Ítem de Mantenimiento modificado correctamente'
          : 'Ítem de Mantenimiento creado correctamente',
        'Cerrar',
        {
          duration: 3000,
        },
      );
      this.emitSuccess();
      this.closeDrawer();
    });
  }
}
