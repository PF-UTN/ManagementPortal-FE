import { OrderService } from '@Common';
import {
  LateralDrawerContainer,
  LoadingComponent,
  TableColumn,
  TableComponent,
  ColumnTypeEnum,
  LateralDrawerService,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, effect } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { ShipmentDetail } from '../../models/shipment-deatil.model';
import { statusOptions } from '../../models/shipment-status-option.model';
import { ShipmentStatusOptions } from '../../models/shipment-status.enum';
import { ShipmentService } from '../../services/shipment.service';

@Component({
  selector: 'mp-shipment-send-drawer',
  standalone: true,
  imports: [
    LoadingComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    TableComponent,
  ],
  templateUrl: './shipment-send-drawer.component.html',
  styleUrl: './shipment-send-drawer.component.scss',
})
export class ShipmentSendDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  orderTableColumns: TableColumn<{
    id: number;
    completed: boolean;
    selected?: boolean;
    status?: string;
  }>[] = [
    {
      columnDef: 'id',
      header: 'N° Orden',
      type: ColumnTypeEnum.VALUE,
      value: (order) => order.id.toString(),
      width: '90%',
    },
    {
      columnDef: 'completed',
      header: 'Completada',
      type: ColumnTypeEnum.SELECT,
      disabled: (order) =>
        order.status === 'Prepared' ||
        !!this.orderUpdatingIds()[order.id] ||
        !!this.orderLockedIds()[order.id],
      width: '10%',
      align: 'center',
    },
  ];

  shipmentId!: number;
  isLoading = signal(true);
  buttonLoading = signal(false);
  data = signal<ShipmentDetail | null>(null);
  orderStates = signal<Record<number, boolean>>({});

  public orderStatusToSet = 6;
  orderUpdatingIds = signal<Record<number, boolean>>({});
  orderLockedIds = signal<Record<number, boolean>>({});

  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly snackBar: MatSnackBar,
    private readonly orderService: OrderService,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            text: 'Enviar',
            click: () => this.confirmSendShipment(),
            loading: this.buttonLoading(),
            disabled: !this.allOrdersChecked(),
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

  getStatusLabel(status: string | number): string {
    let keyToMatch: string | number = status;

    if (typeof status === 'string') {
      const enumMap = ShipmentStatusOptions as unknown as Record<
        string,
        number | string
      >;
      if (Object.hasOwn(enumMap, status)) {
        keyToMatch = enumMap[status];
      }
    }

    const found = statusOptions.find(
      (opt) => String(opt.key) === String(keyToMatch),
    );
    if (found) return found.value;

    return String(status);
  }

  get orderTableItems$() {
    const detail = this.data();
    const states = this.orderStates();
    const items =
      detail?.orders?.map((order) => ({
        id: order.id,
        completed: false,
        selected: states[order.id] ?? order.status === 'Prepared',
        status: order.status,
      })) ?? [];
    return of(items);
  }

  onSelectedRows(rows: { id: number; selected: boolean }[]) {
    const prevStates = this.orderStates();
    const newStates: Record<number, boolean> = {};

    for (const row of rows) {
      if (this.orderLockedIds()[row.id]) {
        newStates[row.id] = true;
        continue;
      }

      newStates[row.id] = row.selected;
      const wasSelected = !!prevStates[row.id];

      if (row.selected && !wasSelected) {
        const start = { ...this.orderUpdatingIds() };
        start[row.id] = true;
        this.orderUpdatingIds.set(start);

        this.buttonLoading.set(true);
        this.orderService
          .updateOrderStatus(row.id, this.orderStatusToSet)
          .subscribe({
            next: () => {
              const done = { ...this.orderUpdatingIds() };
              const doneWithout = Object.fromEntries(
                Object.entries(done).filter(([k]) => k !== String(row.id)),
              ) as Record<number, boolean>;
              this.orderUpdatingIds.set(doneWithout);

              if (Object.keys(this.orderUpdatingIds()).length === 0) {
                this.buttonLoading.set(false);
              }

              const locked = { ...this.orderLockedIds() };
              locked[row.id] = true;
              this.orderLockedIds.set(locked);

              this.snackBar.open('Estado de orden actualizado', 'Cerrar', {
                duration: 2000,
              });
            },
            error: () => {
              const reverted = { ...this.orderStates() };
              reverted[row.id] = false;
              this.orderStates.set(reverted);

              const done = { ...this.orderUpdatingIds() };
              const doneWithout = Object.fromEntries(
                Object.entries(done).filter(([k]) => k !== String(row.id)),
              ) as Record<number, boolean>;
              this.orderUpdatingIds.set(doneWithout);

              if (Object.keys(this.orderUpdatingIds()).length === 0) {
                this.buttonLoading.set(false);
              }

              this.snackBar.open(
                'Error al actualizar el estado de la orden',
                'Cerrar',
                {
                  duration: 3000,
                },
              );
            },
          });
      }
    }
    this.orderStates.set(newStates);
  }

  allOrdersChecked(): boolean {
    const detail = this.data();
    const orders = detail?.orders ?? [];
    const states = this.orderStates();
    if (orders.length === 0) return false;
    return orders.every(
      (order) => states[order.id] ?? order.status === 'Prepared',
    );
  }

  ngOnInit(): void {
    this.shipmentService.getShipmentById(this.shipmentId).subscribe({
      next: (data: ShipmentDetail) => {
        this.data.set(data);
        const initialLocked: Record<number, boolean> = {};
        for (const o of data.orders ?? []) {
          if (o.status === 'Prepared') initialLocked[o.id] = true;
        }
        this.orderLockedIds.set(initialLocked);

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  confirmSendShipment() {
    this.buttonLoading.set(true);
    this.shipmentService.sendShipment(this.shipmentId).subscribe({
      next: () => {
        this.buttonLoading.set(false);
        this.snackBar.open('Envío iniciado con éxito', 'Cerrar', {
          duration: 3000,
        });
        this.lateralDrawerService.close();
        this.emitSuccess();
      },
      error: () => {
        this.buttonLoading.set(false);
        this.snackBar.open('Error al iniciar el envío', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }
}
