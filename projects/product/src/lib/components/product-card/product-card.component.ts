import { ButtonComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { ProductListItem } from '../../models/product-item.model';

@Component({
  selector: 'mp-product-card',
  standalone: true,
  imports: [MatCardModule, CommonModule, ButtonComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() product!: ProductListItem;
  @Input() initialQuantity: number = 1;

  @Output() openDrawer = new EventEmitter<{
    productId: number;
    quantity: number;
  }>();
  @Output() addToCart = new EventEmitter<void>();

  quantity: number = 1;

  onCardKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.openDrawer.emit({
        productId: this.product.id,
        quantity: this.quantity,
      });
    }
  }

  ngOnInit() {
    this.quantity = this.initialQuantity;
  }

  openProductDrawer() {
    this.openDrawer.emit({
      productId: this.product.id,
      quantity: this.quantity,
    });
  }

  onQuantityChange(newQuantity: number) {
    this.quantity = newQuantity;
  }

  onQuantityInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      let value = input.valueAsNumber;
      if (value > this.product.stock) {
        value = this.product.stock;
        input.value = String(value);
      }
      if (value < 1) {
        value = 1;
        input.value = String(value);
      }
      this.onQuantityChange(value);
    }
  }

  onAddToCartKeyDown() {
    this.addToCart.emit();
  }
}
