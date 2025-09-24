import {
  BackArrowComponent,
  TitleComponent,
  ButtonComponent,
  InputComponent,
  LateralDrawerService,
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
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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

import { MaintenancePerformRequest } from '../../models/maintenance-perform.model';
import { SupplierSearchResult } from '../../models/supplier-search-response-model';
import { VehicleService } from '../../services/vehicle.service';
import { CreateUpdateSupplierServiceDrawerComponent } from '../create-update-supplier-service-drawer/create-update-supplier-service-drawer.component';

@Component({
  selector: 'lib-perform-maintenance-plan',
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
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './perform-maintenance-plan.component.html',
  styleUrl: './perform-maintenance-plan.component.scss',
})
export class PerformMaintenancePlanComponent implements OnInit {
  maintenanceForm!: FormGroup<{
    date: FormControl<string | null>;
    kmPerformed: FormControl<number | null>;
    supplier: FormControl<SupplierSearchResult | null>;
  }>;

  vehicleId!: number;
  maintenancePlanItemId!: number;
  isLoading = false;
  isSearching = false;
  kmTraveled!: number;
  filteredSuppliers$!: Observable<SupplierSearchResult[]>;
  readonly CREATE_SUPPLIER_OPTION: SupplierSearchResult = {
    id: -1,
    businessName: '+ Gestionar proveedores',
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
    this.maintenancePlanItemId = Number(
      this.route.snapshot.paramMap.get('maintenanceId'),
    );

    this.maintenanceForm = this.fb.group({
      date: new FormControl<string | null>(null, Validators.required),
      kmPerformed: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1),
      ]),
      supplier: new FormControl<SupplierSearchResult | null>(null, [
        Validators.required,
        this.supplierObjectValidator(),
      ]),
    });

    this.filteredSuppliers$ =
      this.maintenanceForm.controls.supplier.valueChanges.pipe(
        startWith(''),
        debounceTime(200),
        switchMap((value) => {
          this.isSearching = true;
          const searchText =
            typeof value === 'string' ? value : (value?.businessName ?? '');
          return this.vehicleService
            .searchServiceSuppliers({
              searchText,
              page: 1,
              pageSize: 10,
            })
            .pipe(
              map((res) => [...res.results, this.CREATE_SUPPLIER_OPTION]),
              finalize(() => (this.isSearching = false)),
            );
        }),
      );
  }

  displaySupplier(supplier: SupplierSearchResult): string {
    return supplier?.businessName ?? '';
  }

  onSupplierSelected(event: MatAutocompleteSelectedEvent) {
    const supplier = event.option.value as SupplierSearchResult;
    if (supplier.id === -1) {
      this.onCreateSupplierClick();
      this.maintenanceForm.controls.supplier.reset();
      return;
    }
    this.maintenanceForm.patchValue({ supplier });
  }

  onCreateSupplierClick() {
    this.lateralDrawerService
      .open(
        CreateUpdateSupplierServiceDrawerComponent,
        {},
        {
          title: 'Gestionar proveedor',
          size: 'small',
          footer: {
            firstButton: {
              text: 'Cancelar',
              click: () => this.lateralDrawerService.close(),
            },
          },
        },
      )
      .subscribe(() => {
        this.maintenanceForm.controls.supplier.setValue(null);
      });
  }

  supplierObjectValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return { required: true };
      if (
        typeof value === 'object' &&
        value.id !== undefined &&
        value.id !== -1
      )
        return null;
      return { invalidSupplier: true };
    };
  }

  get showEditSupplierIcon(): boolean {
    const value = this.maintenanceForm?.controls?.supplier?.value;
    return !!(value && typeof value === 'object' && value.id !== -1);
  }

  onSave() {
    if (this.maintenanceForm.invalid) {
      this.maintenanceForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const { date, kmPerformed, supplier } = this.maintenanceForm.value;
    const payload: MaintenancePerformRequest = {
      date: date!,
      kmPerformed: kmPerformed!,
      maintenancePlanItemId: this.maintenancePlanItemId,
      serviceSupplierId: supplier!.id,
    };
    this.vehicleService
      .createMaintenanceAsync(this.vehicleId, payload)
      .subscribe({
        next: () => {
          this.snackBar.open(
            'Mantenimiento realizado correctamente',
            'Cerrar',
            { duration: 3000 },
          );
          this.isLoading = false;
          this.location.back();
        },
        error: () => {
          this.snackBar.open(
            'Ocurrió un error al realizar el mantenimiento',
            'Cerrar',
            { duration: 3000 },
          );
          this.isLoading = false;
        },
      });
  }
}
