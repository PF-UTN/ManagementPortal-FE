import { VehicleService, VehicleListItem } from '@Common';
import {
  ListComponent,
  LateralDrawerContainer,
  LateralDrawerService,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, effect, signal } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import {
  startWith,
  switchMap,
  debounceTime,
  map,
  finalize,
} from 'rxjs/operators';

import { CreateShipmentRequest } from '../../models/create-shipment-request.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'lib-create-shipment-drawer',
  standalone: true,
  imports: [
    CommonModule,
    ListComponent,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatNativeDateModule,
    MatAutocompleteModule,
  ],
  templateUrl: './create-shipment-drawer.component.html',
  styleUrl: './create-shipment-drawer.component.scss',
})
export class CreateShipmentDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  @Input() selectedOrders: { id: number }[] = [];

  columns = [
    {
      key: 'id',
      header: 'Pedido número',
      value: (order: { id: number }) => order.id.toString(),
    },
  ];

  filteredVehicles$!: Observable<VehicleListItem[]>;
  today: Date = new Date();
  isSearching = false;

  isFormValid = signal(false);
  isLoading = signal(false);

  shipmentForm!: FormGroup<{
    date: FormControl<string | Date | null>;
    vehicle: FormControl<VehicleListItem | null>;
  }>;

  constructor(
    private readonly vehicleService: VehicleService,
    private readonly orderService: OrderService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            text: 'Crear',
            click: () => this.onCreate(),
            disabled: !this.isFormValid(),
            loading: this.isLoading(),
          },
          secondButton: {
            text: 'Cancelar',
            click: () => this.closeDrawer(),
          },
        },
      };
      this.lateralDrawerService.updateConfig(drawerConfig);
    });
  }

  ngOnInit(): void {
    this.shipmentForm = new FormGroup({
      date: new FormControl<string | Date | null>(null, Validators.required),
      vehicle: new FormControl<VehicleListItem | null>(null, [
        Validators.required,
        this.vehicleObjectValidator(),
      ]),
    });

    this.shipmentForm.valueChanges.subscribe(() => {
      this.isFormValid.set(this.shipmentForm.valid);
    });

    this.filteredVehicles$ =
      this.shipmentForm.controls.vehicle.valueChanges.pipe(
        startWith(''),
        debounceTime(200),
        switchMap((value) => {
          this.isSearching = true;
          const searchText =
            typeof value === 'string' ? value : (value?.licensePlate ?? '');
          return this.vehicleService
            .postSearchVehiclesAsync({ searchText, page: 1, pageSize: 100 })
            .pipe(
              map((res) => res.results.filter((v) => v.enabled === true)),
              finalize(() => (this.isSearching = false)),
            );
        }),
      );
  }

  displayVehicle(vehicle: VehicleListItem): string {
    return vehicle?.licensePlate ?? '';
  }

  onVehicleSelected(event: MatAutocompleteSelectedEvent) {
    const vehicle = event.option.value as VehicleListItem;
    this.shipmentForm.patchValue({ vehicle });
  }

  vehicleObjectValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return { required: true };
      if (typeof value === 'object' && value.id !== undefined) return null;
      return { invalidVehicle: true };
    };
  }

  onCreate() {
    if (this.shipmentForm.invalid) {
      this.shipmentForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);

    const formValue = this.shipmentForm.value;
    let dateString = '';
    if (formValue.date instanceof Date) {
      dateString = formValue.date.toISOString().split('T')[0];
    } else if (typeof formValue.date === 'string') {
      dateString = formValue.date.substring(0, 10);
    }

    const payload: CreateShipmentRequest = {
      date: dateString,
      vehicleId: formValue.vehicle!.id,
      orderIds: this.selectedOrders.map((o) => o.id),
    };

    this.orderService.createShipment(payload).subscribe({
      next: () => {
        this.snackBar.open('Envío creado con éxito', 'Cerrar', {
          duration: 3000,
        });
        this.emitSuccess();
        this.closeDrawer();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al crear el envío', err);
        this.isLoading.set(false);
      },
    });
  }

  closeDrawer() {
    this.lateralDrawerService.close();
  }
}
