import {
  LateralDrawerContainer,
  LateralDrawerService,
  ListColumn,
  ListComponent,
  LoadingComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PurchaseOrderStatusOptionsId } from '../../constants/purchase-order-status-ids.enum';
import {
  PurchaseOrderDetail,
  PurchaseOrderItemDetail,
} from '../../models/purchase-order-detail.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'lib-execute-lateral-drawer',
  standalone: true,
  imports: [CommonModule, LoadingComponent, ListComponent],
  templateUrl: './execute-lateral-drawer.component.html',
  styleUrl: './execute-lateral-drawer.component.scss',
})
export class ExecuteLateralDrawerComponent
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
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            text: 'Ejecutar',
            click: () => this.onSubmit(),
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
    if (!this.purchaseOrderId) {
      console.error(
        'Se requiere un ID de orden de compra para abrir este drawer.',
      );
    }
    this.purchaseOrderService
      .getPurchaseOrderById(this.purchaseOrderId)
      .subscribe({
        next: (purchaseOrderDetail) => {
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

  onSubmit(): void {
    this.isLoading.set(true);

    const payload = {
      purchaseOrderStatusId: PurchaseOrderStatusOptionsId.Ordered,
    };

    this.purchaseOrderService
      .updatePurchaseOrderStatusAsync(this.purchaseOrderId, payload)
      .subscribe({
        next: () => {
          this.emitSuccess();
          this.closeDrawer();
          this.snackBar.open(
            'Orden de compra ejecutada correctamente',
            'Cerrar',
            {
              duration: 3000,
            },
          );
          this.isLoading.set(false);
        },
        error: () => {
          const msg = 'Error al ejecutar la orden de compra.';
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
          this.isLoading.set(false);
        },
      });
  }

  closeDrawer() {
    this.lateralDrawerService.close();
  }
}
