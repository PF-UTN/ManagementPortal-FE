import {
  LateralDrawerContainer,
  LoadingComponent,
  TableColumn,
  ColumnTypeEnum,
  TableComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';

import {
  ShipmentDetail,
  ShipmentOrder,
} from '../../models/shipment-deatil.model';
import { orderStatusOptions } from '../../models/shipment-order-status.model';
import { ShipmentStatusOptions } from '../../models/shipment-status.enum';
import { ShipmentService } from '../../services/shipment.service';

@Component({
  selector: 'mp-shipment-detail-drawer',
  standalone: true,
  imports: [
    LoadingComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    TableComponent,
  ],
  templateUrl: './shipment-detail-drawer.component.html',
  styleUrl: './shipment-detail-drawer.component.scss',
})
export class ShipmentDetailDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  orderColumns: TableColumn<ShipmentOrder>[] = [
    {
      columnDef: 'id',
      header: 'N° Orden',
      type: ColumnTypeEnum.VALUE,
      width: '60%',
      value: (order) => order.id.toString(),
    },
    {
      columnDef: 'status',
      header: 'Estado',
      type: ColumnTypeEnum.VALUE,
      width: '40%',
      align: 'left',
      value: (order) => this.getOrderStatusLabel(order.status),
    },
  ];

  shipmentId!: number;
  isLoading = signal(true);
  data = signal<ShipmentDetail | null>(null);

  constructor(private readonly shipmentService: ShipmentService) {
    super();
  }

  getStatusLabel(status: string): string {
    const label =
      ShipmentStatusOptions[status as keyof typeof ShipmentStatusOptions];
    return label || status;
  }

  getOrderStatusLabel(status: string): string {
    const found = orderStatusOptions.find((opt) => opt.key === status);
    return found ? found.value : status;
  }

  get orderDataSource$() {
    const orders = this.data()?.orders ?? [];
    return of(orders);
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
}
