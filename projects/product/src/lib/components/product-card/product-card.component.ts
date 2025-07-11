import { ButtonComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { ProductListItem } from '../../models/product-item.model';

@Component({
  selector: 'lib-product-card',
  standalone: true,
  imports: [MatCardModule, CommonModule, ButtonComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() product!: ProductListItem;
  @Input() quantities!: { [productId: number]: number };
  @Input() stockError!: { [productId: number]: boolean };

  @Output() openDrawer = new EventEmitter<number>();
  @Output() increase = new EventEmitter<number>();
  @Output() decrease = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<void>();
  @Output() quantityInput = new EventEmitter<{
    productId: number;
    event: Event;
  }>();

  onCardKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.openDrawer.emit(this.product.id);
    }
  }

  openProductDrawer(productId: number) {
    this.openDrawer.emit(productId);
  }

  canOpenProductDrawer(item: ProductListItem): boolean {
    return item.stock > 0;
  }

  increaseQuantity(productId: number) {
    this.increase.emit(productId);
  }

  decreaseQuantity(productId: number) {
    this.decrease.emit(productId);
  }

  onQuantityInput(productId: number, event: Event) {
    this.quantityInput.emit({ productId, event });
  }

  onAddToCartKeyDown() {
    this.addToCart.emit();
  }
}
