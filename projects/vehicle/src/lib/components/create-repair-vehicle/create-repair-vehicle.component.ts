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
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  map,
  startWith,
  switchMap,
  debounceTime,
  finalize,
} from 'rxjs/operators';

import { RepairCreate } from '../../../../../common/src/models/vehicle/repair-create.model';
import { SupplierSearchResult } from '../../../../../common/src/models/vehicle/supplier-search-response-model';
import { CreateUpdateSupplierServiceDrawerComponent } from '../create-update-supplier-service-drawer/create-update-supplier-service-drawer.component';

@Component({
  selector: 'mp-create-repair-vehicle',
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
    LoadingComponent,
  ],
  templateUrl: './create-repair-vehicle.component.html',
  styleUrl: './create-repair-vehicle.component.scss',
})
export class CreateRepairVehicleComponent implements OnInit {
  repairForm!: FormGroup<{
    date: FormControl<string | null>;
    description: FormControl<string | null>;
    kmPerformed: FormControl<number | null>;
    supplier: FormControl<SupplierSearchResult | null>;
  }>;

  repairId?: number;
  vehicleId!: number;
  isSupplierLoading = false;
  isLoading = false;
  isSearching = false;
  filteredSuppliers$!: Observable<SupplierSearchResult[]>;
  readonly CREATE_SUPPLIER_OPTION: SupplierSearchResult = {
    id: -1,
    businessName: '+ Gestionar proveedores',
  };
  title = 'Registrar Reparación';

  constructor(
    public fb: FormBuilder,
    private readonly vehicleService: VehicleService,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
    private readonly location: Location,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('vehicleId'));

    this.repairForm = this.fb.group({
      date: new FormControl<string | null>(null, Validators.required),
      description: new FormControl<string | null>(null, Validators.required),
      kmPerformed: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1),
      ]),
      supplier: new FormControl<SupplierSearchResult | null>(null, [
        Validators.required,
        this.supplierObjectValidator(),
      ]),
    });

    const repairState =
      typeof history.state === 'object' &&
      history.state !== null &&
      'repair' in history.state
        ? (history.state.repair as {
            id?: number;
            date?: string;
            description?: string;
            kmPerformed?: number;
            serviceSupplierId?: number;
          })
        : undefined;

    if (repairState) {
      this.title = 'Editar Reparación';
      this.isSupplierLoading = true;
      this.repairId = repairState.id;
      this.repairForm.patchValue({
        date: repairState.date ?? null,
        description: repairState.description ?? null,
        kmPerformed: repairState.kmPerformed ?? null,
      });

      if (repairState.serviceSupplierId) {
        this.vehicleService
          .getSupplierById(repairState.serviceSupplierId)
          .subscribe({
            next: (supplier) => {
              this.repairForm.controls.supplier.setValue({
                id: supplier.id,
                businessName: supplier.businessName,
              });
              this.isSupplierLoading = false;
            },
            error: () => {
              this.repairForm.controls.supplier.setValue(null);
              this.isSupplierLoading = false;
            },
          });
      }
    }

    this.filteredSuppliers$ =
      this.repairForm.controls.supplier.valueChanges.pipe(
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
      this.repairForm.controls.supplier.reset();
      return;
    }
    this.repairForm.patchValue({ supplier });
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
        this.repairForm.controls.supplier.setValue(null);
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

  onButtonKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.onSave();
    }
  }

  onSave() {
    if (this.repairForm.invalid) {
      this.repairForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const formValue = this.repairForm.value;
    const payload: RepairCreate = {
      date: formValue.date!,
      description: formValue.description!,
      kmPerformed: formValue.kmPerformed!,
      serviceSupplierId: formValue.supplier!.id,
    };

    const request$ = this.repairId
      ? this.vehicleService.updateRepairAsync(this.repairId, payload)
      : this.vehicleService.createRepairAsync(this.vehicleId, payload);

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Reparación guardada', 'Cerrar', { duration: 2000 });
        this.location.back();
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al guardar la reparación', 'Cerrar', {
          duration: 2000,
        });
      },
    });
  }
}
