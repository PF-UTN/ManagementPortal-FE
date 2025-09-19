import {
  LateralDrawerContainer,
  LateralDrawerService,
  LoadingComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ProductDetail } from '../../models/product-detail.model';
import { ProductService } from '../../services/product.service';
@Component({
  selector: 'lib-detail-lateral-drawer',
  standalone: true,
  imports: [CommonModule, LoadingComponent, MatSlideToggleModule],
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
  }
  ngOnInit(): void {
    if (!this.productId) {
      console.error('Se requiere un productId para abrir este drawer.');
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
}
