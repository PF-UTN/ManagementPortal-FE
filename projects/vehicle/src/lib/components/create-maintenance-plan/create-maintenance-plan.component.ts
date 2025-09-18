import {
  BackArrowComponent,
  TitleComponent,
  ButtonComponent,
  InputComponent,
} from '@Common-UI';

import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  map,
  startWith,
  switchMap,
  debounceTime,
  finalize,
} from 'rxjs/operators';

import { MaintenanceItemSearchResult } from '../../models/maintenance-item-response.model';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'lib-create-maintenance-plan',
  standalone: true,
  imports: [
    BackArrowComponent,
    TitleComponent,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    ButtonComponent,
    InputComponent,
    MatButtonModule,
  ],
  templateUrl: './create-maintenance-plan.component.html',
  styleUrl: './create-maintenance-plan.component.scss',
})
export class CreateMaintenancePlanComponent implements OnInit {
  maintenanceForm!: FormGroup<{
    maintenanceItem: FormControl<MaintenanceItemSearchResult | null>;
    maintenanceItemId: FormControl<number | null>;
    kmInterval: FormControl<number | null>;
    timeInterval: FormControl<number | null>;
  }>;

  vehicleId!: number;
  isLoading = false;
  isSearching = false;
  maintenanceItems: MaintenanceItemSearchResult[] = [];
  filteredMaintenanceItems$!: Observable<MaintenanceItemSearchResult[]>;
  readonly MANAGE_MAINTENANCE_ITEM_OPTION: MaintenanceItemSearchResult = {
    id: -1,
    description: '+ Crear item de mantenimiento',
  };

  constructor(
    public fb: FormBuilder,
    private readonly vehicleService: VehicleService,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
    private readonly location: Location,
  ) {}

  ngOnInit(): void {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('vehicleId'));
    this.maintenanceForm = this.fb.group(
      {
        maintenanceItem: new FormControl<MaintenanceItemSearchResult | null>(
          null,
          [Validators.required, this.maintenanceItemObjectValidator()],
        ),
        maintenanceItemId: new FormControl<number | null>(
          null,
          Validators.required,
        ),
        kmInterval: new FormControl<number | null>(null),
        timeInterval: new FormControl<number | null>(null),
      },
      { validators: this.intervalValidator },
    );

    this.filteredMaintenanceItems$ =
      this.maintenanceForm.controls.maintenanceItem.valueChanges.pipe(
        startWith(''),
        debounceTime(200),
        switchMap((value) => {
          this.isSearching = true;
          const searchText =
            typeof value === 'string' ? value : (value?.description ?? '');
          return this.vehicleService
            .postSearchMaintenanceItem({ searchText, page: 1, pageSize: 10 })
            .pipe(
              map((res) => [
                ...res.results,
                this.MANAGE_MAINTENANCE_ITEM_OPTION,
              ]),
              finalize(() => (this.isSearching = false)),
            );
        }),
      );
  }

  displayMaintenanceItem(item: MaintenanceItemSearchResult): string {
    return item?.description ?? '';
  }

  onMaintenanceItemSelected(event: MatAutocompleteSelectedEvent) {
    const item = event.option.value as MaintenanceItemSearchResult;
    if (item.id === -1) {
      // Acá abriría el drawer/modal para crear un nuevo item de mantenimiento
      this.maintenanceForm.controls.maintenanceItem.reset();
    } else {
      this.maintenanceForm.patchValue({ maintenanceItemId: item.id });
    }
  }

  maintenanceItemObjectValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return { required: true };
      if (typeof value === 'object' && value.id !== undefined) return null;
      return { invalidMaintenanceItem: true };
    };
  }

  intervalValidator: ValidatorFn = (group: AbstractControl) => {
    const km = group.get('kmInterval')?.value;
    const time = group.get('timeInterval')?.value;
    if ((km == null || km === '') && (time == null || time === '')) {
      return { invalidInterval: true };
    }
    return null;
  };

  onSave() {
    if (this.maintenanceForm.invalid) {
      this.maintenanceForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const { maintenanceItemId, kmInterval, timeInterval } =
      this.maintenanceForm.value;
    const payload = {
      vehicleId: this.vehicleId,
      maintenanceItemId: maintenanceItemId!,
      kmInterval: kmInterval ?? null,
      timeInterval: timeInterval ?? null,
    };
    this.vehicleService.createMaintenancePlanItem(payload).subscribe({
      next: () => {
        this.snackBar.open(
          'Item de mantenimiento creado correctamente',
          'Cerrar',
          { duration: 3000 },
        );
        this.isLoading = false;
        this.location.back();
      },
      error: () => {
        this.snackBar.open('Ocurrió un error al crear el item', 'Cerrar', {
          duration: 3000,
        });
        this.isLoading = false;
      },
    });
  }

  get canEditSelectedItem(): boolean {
    const item = this.maintenanceForm.controls.maintenanceItem.value;
    return !!item && item.id !== -1;
  }

  onEditSelectedItem() {
    const item = this.maintenanceForm.controls.maintenanceItem.value;
    console.log('Editar item:', item);
  }
}
