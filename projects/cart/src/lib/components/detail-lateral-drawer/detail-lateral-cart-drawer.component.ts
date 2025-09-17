import { LateralDrawerContainer, LoadingComponent } from '@Common-UI';
import { ProductDetail, ProductService } from '@Product';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, Input } from '@angular/core';

@Component({
  selector: 'mp-detail-lateral-cart-drawer',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './detail-lateral-cart-drawer.component.html',
  styleUrl: './detail-lateral-cart-drawer.component.scss',
})
export class DetailLateralCartDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  @Input() quantity: number = 1;
  productId!: number;

  data = signal<ProductDetail | null>(null);
  error = signal<string | null>(null);
  isLoading = signal(true);

  constructor(private readonly productService: ProductService) {
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
