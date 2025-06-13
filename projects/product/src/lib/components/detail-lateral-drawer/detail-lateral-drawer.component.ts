import { LateralDrawerContainer, LateralDrawerService } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProductDetail } from '../../models/product-detail.model';
import { ProductService } from '../../services/product.service';
@Component({
  selector: 'lib-detail-lateral-drawer',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './detail-lateral-drawer.component.html',
  styleUrl: './detail-lateral-drawer.component.scss',
})
export class DetailLateralDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  productId!: number;

  data = signal<ProductDetail | null>(null);
  error = signal<string | null>(null);
  isLoading = signal(true);

  constructor(
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly productService: ProductService,
  ) {
    super();

    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            click: () => this.closeDrawer(),
            text: 'Cancelar',
          },
        },
      };

      this.lateralDrawerService.updateConfig(drawerConfig);
    });
  }
  ngOnInit(): void {
    if (!this.productId) {
      this.isLoading.set(false);
      return;
    }

    this.productService.getProductById(this.productId).subscribe({
      next: (productDetail) => {
        this.data.set(productDetail);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo obtener el detalle del producto.');
        this.isLoading.set(false);
      },
    });
  }

  closeDrawer(): void {
    this.lateralDrawerService.close();
  }
}
