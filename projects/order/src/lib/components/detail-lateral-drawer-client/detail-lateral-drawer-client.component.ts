import {
  LateralDrawerContainer,
  LateralDrawerService,
  ListColumn,
  ListComponent,
  LoadingComponent,
} from '@Common-UI';
import { OrderService } from '@Order';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';

import {
  OrderClientDetail,
  OrderDetailItem,
} from '../../models/order-detail-client.model';

@Component({
  selector: 'mp-detail-lateral-drawer-client',
  standalone: true,
  imports: [CommonModule, LoadingComponent, ListComponent],
  templateUrl: './detail-lateral-drawer-client.component.html',
  styleUrl: './detail-lateral-drawer-client.component.scss',
})
export class DetailLateralDrawerClientComponent
  extends LateralDrawerContainer
  implements OnInit
{
  orderId!: number;

  data = signal<OrderClientDetail | null>(null);
  error = signal<string | null>(null);
  isLoading = signal(true);

  productColumns: ListColumn<OrderDetailItem>[] = [
    {
      key: 'product',
      header: 'Producto',
      value: (item) => item.product.name,
      bootstrapCol: 'col-md-3',
    },
    {
      key: 'category',
      header: 'Categoría',
      value: (item) => item.product.category.name,
      bootstrapCol: 'col-md-2',
    },
    {
      key: 'quantity',
      header: 'Cantidad',
      value: (item) => item.quantity.toString(),
      bootstrapCol: 'col-md-2',
    },
    {
      key: 'unitPrice',
      header: 'Precio Unitario',
      value: (item) =>
        item.unitPrice.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }),
      bootstrapCol: 'col-md-2',
    },
    {
      key: 'subtotalPrice',
      header: 'Subtotal',
      value: (item) =>
        item.subtotalPrice.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }),
      bootstrapCol: 'col-md-2',
    },
  ];

  constructor(
    private readonly orderService: OrderService,
    private readonly lateralDrawerService: LateralDrawerService,
  ) {
    super();
  }

  ngOnInit(): void {
    if (!this.orderId) {
      console.error('Se requiere un ID del pedido para abrir este drawer.');
    }
    this.orderService.getOrderClientDetail(this.orderId).subscribe({
      next: (orderDetail) => {
        console.log(orderDetail);
        this.data.set(orderDetail);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo obtener el detalle del pedido.');
        this.isLoading.set(false);
      },
    });
  }
}
