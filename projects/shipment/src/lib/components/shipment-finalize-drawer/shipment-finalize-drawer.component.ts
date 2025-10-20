import {
  LateralDrawerContainer,
  LoadingComponent,
  LateralDrawerService,
  InputComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, effect } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { ShipmentDetail } from '../../models/shipment-deatil.model';
import { ShipmentFinishRequest } from '../../models/shipment-finisih-request.model';
import { statusOptions } from '../../models/shipment-status-option.model';
import { ShipmentStatusOptions } from '../../models/shipment-status.enum';
import { ShipmentService } from '../../services/shipment.service';

@Component({
  selector: 'mp-shipment-finalize-drawer',
  standalone: true,
  imports: [
    LoadingComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    InputComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './shipment-finalize-drawer.component.html',
  styleUrl: './shipment-finalize-drawer.component.scss',
})
export class ShipmentFinalizeDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  finalizeForm!: FormGroup<{
    finishedAt: FormControl<Date | null>;
    odometer: FormControl<number | null>;
    orderChecks: FormArray<FormControl<boolean>>;
  }>;

  today: Date = new Date();
  shipmentId!: number;
  data = signal<ShipmentDetail | null>(null);
  isLoading = signal(true);
  buttonLoading = signal(false);
  validForm = signal(false);
  orderStates = signal<Record<number, boolean>>({});

  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly snackBar: MatSnackBar,
    private readonly fb: FormBuilder,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            text: 'Finalizar',
            click: () => this.finalizeShipment(),
            loading: this.buttonLoading(),
            disabled: !this.validForm(),
          },
          secondButton: {
            text: 'Cerrar',
            click: () => this.lateralDrawerService.close(),
          },
        },
      };
      this.lateralDrawerService.updateConfig(drawerConfig);
    });
  }

  ngOnInit(): void {
    this.finalizeForm = new FormGroup({
      finishedAt: new FormControl<Date | null>(this.today, Validators.required),
      odometer: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(0),
      ]),
      orderChecks: new FormArray<FormControl<boolean>>([]),
    });

    this.finalizeForm.valueChanges.subscribe(() =>
      this.validForm.set(this.finalizeForm.valid),
    );

    this.shipmentService.getShipmentById(this.shipmentId).subscribe({
      next: (data: ShipmentDetail) => {
        this.data.set(data);

        const checksArray = new FormArray<FormControl<boolean>>(
          (data.orders ?? []).map(
            () => new FormControl<boolean>(true, { nonNullable: true }),
          ),
        );
        this.finalizeForm.setControl('orderChecks', checksArray);

        const initialStates: Record<number, boolean> = {};
        (data.orders ?? []).forEach((order) => {
          initialStates[order.id] = true;
        });
        this.orderStates.set(initialStates);

        const odometerControl = this.finalizeForm.get(
          'odometer',
        ) as FormControl<number | null>;
        odometerControl.setValidators([
          Validators.required,
          this.odometerGreaterThanKmTraveledValidator(data.vehicle.kmTraveled),
        ]);
        odometerControl.updateValueAndValidity();

        checksArray.valueChanges.subscribe((values: boolean[]) => {
          const orders = data.orders ?? [];
          const newStates: Record<number, boolean> = {};
          orders.forEach((order, idx) => {
            newStates[order.id] = values[idx];
          });
          this.orderStates.set(newStates);
        });

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  odometerGreaterThanKmTraveledValidator = (
    kmTraveled: number,
  ): ValidatorFn => {
    return (control: AbstractControl) => {
      const value = control.value as number | null;
      if (value !== null && value <= kmTraveled) {
        return { minOdometer: { requiredMin: kmTraveled + 1, actual: value } };
      }
      return null;
    };
  };

  onOrderCheckChange(orderId: number, checked: boolean) {
    const detail = this.data();
    if (!detail) return;
    const idx = (detail.orders ?? []).findIndex(
      (order) => order.id === orderId,
    );
    if (idx !== -1) {
      (this.finalizeForm.get('orderChecks') as FormArray)
        .at(idx)
        .setValue(checked);
    }
  }

  getShipmentStatusLabel(status: string | number): string {
    let keyToMatch: string | number = status;

    if (typeof status === 'string') {
      const enumMap = ShipmentStatusOptions as unknown as Record<
        string,
        number | string
      >;
      if (Object.prototype.hasOwnProperty.call(enumMap, status)) {
        keyToMatch = enumMap[status];
      }
    }

    const found = statusOptions.find(
      (opt) => String(opt.key) === String(keyToMatch),
    );
    return found ? found.value : String(status);
  }

  get orderTableItems$() {
    const detail = this.data();
    const checks =
      (this.finalizeForm?.get('orderChecks')?.value as boolean[]) ?? [];
    const items =
      detail?.orders?.map((order, idx) => ({
        id: order.id,
        completed: checks[idx] ?? true,
        status: order.status,
      })) ?? [];
    return of(items);
  }

  get orderChecksArray(): FormArray<FormControl<boolean>> {
    return this.finalizeForm.get('orderChecks') as FormArray<
      FormControl<boolean>
    >;
  }

  finalizeShipment() {
    this.buttonLoading.set(true);

    const detail = this.data();
    const finishedAt: Date = this.finalizeForm.value.finishedAt!;
    const odometer: number = this.finalizeForm.value.odometer!;
    const checks = this.finalizeForm.value.orderChecks as boolean[];

    const orders = (detail?.orders ?? []).map((order, idx) => ({
      orderId: order.id,
      orderStatusId: checks[idx] ? 4 : 1,
    }));

    const body: ShipmentFinishRequest = {
      finishedAt: finishedAt.toISOString().slice(0, 19).replace('T', ' '),
      odometer,
      orders,
    };

    this.shipmentService.finishShipment(this.shipmentId, body).subscribe({
      next: () => {
        this.buttonLoading.set(false);
        this.snackBar.open('Envío finalizado con éxito', 'Cerrar', {
          duration: 2000,
        });
        this.lateralDrawerService.close();
        setTimeout(() => {
          window.location.reload();
        }, 700);
      },
      error: () => {},
    });
  }
}
