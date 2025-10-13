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
  orderTableColumns: TableColumn<{ id: number; completed: boolean }>[] = [
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
      disabled: () => false,
      width: '10%',
      align: 'center',
    },
  ];

  shipmentId!: number;
  isLoading = signal(true);
  buttonLoading = signal(false);
  data = signal<ShipmentDetail | null>(null);
  orderStates = signal<Record<number, boolean>>({});

  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly snackBar: MatSnackBar,
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

  getStatusLabel(status: string): string {
    const found = statusOptions.find((opt) => opt.key === status);
    return found ? found.value : status;
  }

  get orderTableItems$() {
    const detail = this.data();
    const states = this.orderStates();
    const items =
      detail?.orders?.map((id) => ({
        id,
        completed: false,
        selected: states[id] ?? false,
      })) ?? [];
    return of(items);
  }

  onSelectedRows(rows: { id: number; selected: boolean }[]) {
    const newStates: Record<number, boolean> = {};
    rows.forEach((row) => {
      newStates[row.id] = row.selected;
    });
    this.orderStates.set(newStates);
  }

  allOrdersChecked(): boolean {
    const detail = this.data();
    const orders = detail?.orders ?? [];
    const states = this.orderStates();
    if (orders.length === 0) return false;
    return orders.every((id) => states[id]);
  }

  ngOnInit(): void {
    this.shipmentService.getShipmentById(this.shipmentId).subscribe({
      next: (data: ShipmentDetail) => {
        this.data.set(data);
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
