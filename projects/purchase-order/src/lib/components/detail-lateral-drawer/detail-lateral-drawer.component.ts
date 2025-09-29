import {
  LateralDrawerContainer,
  LateralDrawerService,
  ListColumn,
  ListComponent,
  LoadingComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';

import {
  PurchaseOrderDetail,
  PurchaseOrderItemDetail,
} from '../../models/purchase-order-detail.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'mp-detail-lateral-drawer',
  standalone: true,
  imports: [CommonModule, LoadingComponent, ListComponent],
  templateUrl: './detail-lateral-drawer.component.html',
  styleUrl: './detail-lateral-drawer.component.scss',
})
export class DetailLateralDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  purchaseOrderId!: number;

  data = signal<PurchaseOrderDetail | null>(null);
  error = signal<string | null>(null);
  isLoading = signal(true);

  productColumns: ListColumn<PurchaseOrderItemDetail>[] = [
    {
      key: 'product',
      header: 'Producto',
      value: (item) => item.productName,
      bootstrapCol: 'col-md-4',
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
      bootstrapCol: 'col-md-3',
    },
    {
      key: 'subtotalPrice',
      header: 'Subtotal',
      value: (item) =>
        item.subtotalPrice.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }),
      bootstrapCol: 'col-md-3',
    },
  ];

  constructor(
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly lateralDrawerService: LateralDrawerService,
  ) {
    super();
  }

  ngOnInit(): void {
    if (!this.purchaseOrderId) {
      console.error(
        'Se requiere un ID de orden de compra para abrir este drawer.',
      );
    }
    this.purchaseOrderService
      .getPurchaseOrderById(this.purchaseOrderId)
      .subscribe({
        next: (purchaseOrderDetail) => {
          console.log(purchaseOrderDetail);
          this.data.set(purchaseOrderDetail);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set(
            'No se pudo obtener el detalle de la orden de compra.',
          );
          this.isLoading.set(false);
        },
      });
  }
}
