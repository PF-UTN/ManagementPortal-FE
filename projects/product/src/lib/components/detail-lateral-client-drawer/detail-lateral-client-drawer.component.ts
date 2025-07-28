import {
  LateralDrawerContainer,
  LoadingComponent,
  ButtonComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, Input } from '@angular/core';

import { ProductDetail } from '../../models/product-detail.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'mp-detail-lateral-client-drawer',
  standalone: true,
  imports: [CommonModule, LoadingComponent, ButtonComponent],
  templateUrl: './detail-lateral-client-drawer.component.html',
  styleUrl: './detail-lateral-client-drawer.component.scss',
})
export class DetailLateralClientDrawerComponent
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

  increaseQuantity() {
    const product = this.data();
    if (product && this.quantity < product.stock.quantityAvailable) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onQuantityInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    const product = this.data();
    if (product) {
      if (value < 1) value = 1;
      if (value > product.stock.quantityAvailable)
        value = product.stock.quantityAvailable;
      this.quantity = value;
    }
  }
}
