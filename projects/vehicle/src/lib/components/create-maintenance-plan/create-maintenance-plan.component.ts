import { VehicleService } from '@Common';
import {
  BackArrowComponent,
  TitleComponent,
  ButtonComponent,
  InputComponent,
  LateralDrawerService,
  LoadingComponent,
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

import { MaintenanceItemSearchResult } from '../../../../../common/src/models/vehicle/maintenance-item-response.model';
import { CreateUpdateMaintenanceItemLateralDrawerComponent } from '../create-update-maintenance-item-drawer/create-update-maintenance-item-lateral-drawer.component';

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
    LoadingComponent,
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
  isInitialLoading = false;
  isSearching = false;
  isEditMode = false;

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
    private readonly lateralDrawerService: LateralDrawerService,
  ) {}

  ngOnInit(): void {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('vehicleId'));
    const planFromState: {
      kmInterval: number | null;
      timeInterval: number | null;
      description: string;
    } | null =
      history.state && 'plan' in history.state ? history.state.plan : null;
    this.isEditMode = !!planFromState;

    if (this.isEditMode) {
      this.isInitialLoading = true;
    }

    this.maintenanceForm = this.fb.group(
      {
        maintenanceItem: new FormControl<MaintenanceItemSearchResult | null>(
          null,
          [this.maintenanceItemObjectValidator()],
        ),
        maintenanceItemId: new FormControl<number | null>(
          null,
          this.isEditMode ? [] : [Validators.required],
        ),
        kmInterval: new FormControl<number | null>(null),
        timeInterval: new FormControl<number | null>(null),
      },
      { validators: this.intervalValidator },
    );

    this.maintenanceForm.controls.maintenanceItem.valueChanges.subscribe(
      (item) => this.syncMaintenanceItemId(item),
    );

    if (planFromState) {
      this.vehicleService
        .postSearchMaintenanceItem({
          searchText: planFromState.description,
          page: 1,
          pageSize: 10,
        })
        .subscribe((res) => {
          const found =
            res.results.find(
              (item: MaintenanceItemSearchResult) =>
                item.description === planFromState.description,
            ) ?? null;
          this.patchFormWithPlan(planFromState, found);
          this.isInitialLoading = false;
        });
    } else {
      this.isInitialLoading = false;
    }

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

  private syncMaintenanceItemId(
    item: MaintenanceItemSearchResult | null,
  ): void {
    const id = item?.id ?? null;
    this.maintenanceForm.controls.maintenanceItemId.setValue(id, {
      emitEvent: false,
    });
  }

  private patchFormWithPlan(
    plan: { kmInterval: number | null; timeInterval: number | null },
    found: MaintenanceItemSearchResult | null,
  ): void {
    this.maintenanceForm.patchValue({
      maintenanceItem: found,
      maintenanceItemId: found?.id ?? null,
      kmInterval: plan.kmInterval,
      timeInterval: plan.timeInterval,
    });
  }

  displayMaintenanceItem(item: MaintenanceItemSearchResult): string {
    return item?.description ?? '';
  }

  onMaintenanceItemSelected(event: MatAutocompleteSelectedEvent) {
    const item = event.option.value as MaintenanceItemSearchResult;
    if (item.id === -1) {
      this.handleCreateOrUpdateMaintenanceItemLateralDrawer();
      return;
    }

    this.maintenanceForm.patchValue({
      maintenanceItemId: item.id,
      maintenanceItem: item,
    });
  }

  onMaintenanceItemEditClick() {
    this.handleCreateOrUpdateMaintenanceItemLateralDrawer(
      this.maintenanceForm.controls.maintenanceItem.value!,
    );
  }

  private handleCreateOrUpdateMaintenanceItemLateralDrawer(
    maintenanceItem?: MaintenanceItemSearchResult,
  ) {
    this.lateralDrawerService
      .open(
        CreateUpdateMaintenanceItemLateralDrawerComponent,
        { maintenanceItem },
        {
          title: 'Crear Ítem de Mantenimiento',
          footer: {
            firstButton: {
              click: () => {},
              text: 'Crear',
            },
            secondButton: {
              click: () => {},
              text: 'Cancelar',
            },
          },
          size: 'small',
        },
      )
      .subscribe(() => this.maintenanceForm.controls.maintenanceItem.reset());
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
    const planId =
      this.route.snapshot.paramMap.get('id') ?? history.state.plan?.id;
    const payload = {
      maintenanceItemId: maintenanceItemId!,
      kmInterval: kmInterval ?? null,
      timeInterval: timeInterval ?? null,
    };

    if (planId) {
      this.vehicleService
        .updateMaintenancePlanItem(Number(planId), payload)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Item de mantenimiento actualizado correctamente',
              'Cerrar',
              { duration: 3000 },
            );
            this.isLoading = false;
            this.location.back();
          },
          error: () => {
            this.snackBar.open(
              'Ocurrió un error al actualizar el item',
              'Cerrar',
              { duration: 3000 },
            );
            this.isLoading = false;
          },
        });
    } else {
      this.vehicleService
        .createMaintenancePlanItem({
          vehicleId: this.vehicleId,
          ...payload,
        })
        .subscribe({
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
  }
}
