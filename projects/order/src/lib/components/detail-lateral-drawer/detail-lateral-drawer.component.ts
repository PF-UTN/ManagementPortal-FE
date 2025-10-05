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

import { OrderDetailItem, OrderDetail } from '../../models/order-detail.model';
@Component({
  selector: 'mp-detail-lateral-drawer-client',
  standalone: true,
  imports: [CommonModule, LoadingComponent, ListComponent],
  templateUrl: './detail-lateral-drawer.component.html',
  styleUrl: './detail-lateral-drawer.component.scss',
})
export class DetailLateralDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  orderId!: number;

  data = signal<OrderDetail | null>(null);
  error = signal<string | null>(null);
  isLoading = signal(true);

  productColumns: ListColumn<OrderDetailItem>[] = [
    {
      key: 'product',
      header: 'Producto',
      value: (item) => item.product.name,
    },
    {
      key: 'weight',
      header: 'Peso',
      value: (item) => item.product.weight.toString(),
    },
    {
      key: 'category',
      header: 'Categoría',
      value: (item) => item.product.category.name,
    },
    {
      key: 'enabled',
      header: 'Habilitado',
      value: (item) => (item.product.enabled ? 'Sí' : 'No'),
    },
    {
      key: 'stock',
      header: 'Stock Disponible',
      value: (item) => item.product.stock.quantityAvailable.toString(),
    },
    {
      key: 'supplier',
      header: 'Proveedor',
      value: (item) => item.product.supplier.businessName,
    },
    {
      key: 'quantity',
      header: 'Cantidad',
      value: (item) => item.quantity.toString(),
    },
    {
      key: 'unitPrice',
      header: 'Precio Unitario',
      value: (item) =>
        item.unitPrice.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }),
    },
    {
      key: 'subtotalPrice',
      header: 'Subtotal',
      value: (item) =>
        item.subtotalPrice.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }),
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
    this.orderService.getOrderDetail(this.orderId).subscribe({
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
