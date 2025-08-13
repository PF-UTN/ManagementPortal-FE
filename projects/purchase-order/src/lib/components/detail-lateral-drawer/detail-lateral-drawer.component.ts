import {
  LateralDrawerContainer,
  LateralDrawerService,
  LoadingComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';

import { PurchaseOrderDetail } from '../../models/purchase-order-detail.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'mp-detail-lateral-drawer',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
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
