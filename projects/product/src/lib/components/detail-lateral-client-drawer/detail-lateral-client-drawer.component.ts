import { CartService, CartUpdateProductQuantity } from '@Cart';
import {
  LateralDrawerContainer,
  LoadingComponent,
  ButtonComponent,
  LateralDrawerService,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, Input, effect } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            click: () => this.confirmAddToCart(),
            text: 'Agregar al carrito',
            loading: this.isLoading(),
            disabled:
              this.isLoading() ||
              (this.data() ? this.data()!.stock.quantityAvailable === 0 : true),
          },
          secondButton: {
            click: () => this.closeDrawer(),
            text: 'Cancelar',
            disabled: this.isLoading(),
          },
        },
      };
      this.lateralDrawerService.updateConfig(drawerConfig);
    });
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

  closeDrawer() {
    this.lateralDrawerService.close();
  }

  confirmAddToCart() {
    this.isLoading.set(true);

    const product = this.data();
    if (!product) return;

    this.cartService.getCart().subscribe({
      next: (cart) => {
        const existingItem = cart.items.find(
          (item) => item.product.id === this.productId,
        );
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const maxStock = product.stock.quantityAvailable;

        let totalQuantity = currentQuantity + this.quantity;
        let stockAdjusted = false;

        if (totalQuantity > maxStock) {
          totalQuantity = maxStock;
          stockAdjusted = true;
          this.snackBar.open(
            `Ha alcanzado el stock máximo de ${maxStock} unidades.`,
            'Cerrar',
            { duration: 3000 },
          );
        }

        const params: CartUpdateProductQuantity = {
          productId: this.productId,
          quantity: totalQuantity,
        };

        this.cartService.addProductToCart(params).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.closeDrawer();
            if (!stockAdjusted) {
              this.snackBar.open('Producto agregado al carrito', 'Cerrar', {
                duration: 3000,
              });
            }
          },
          error: () => {
            this.isLoading.set(false);
            this.snackBar.open(
              'Error al agregar el producto al carrito',
              'Cerrar',
              {
                duration: 3000,
              },
            );
          },
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('No se pudo obtener el carrito', 'Cerrar', {
          duration: 3000,
        });
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
      const maxStock = product.stock.quantityAvailable;

      if (isNaN(value) || value < 1) {
        value = 1;
      }
      if (value > maxStock) {
        value = maxStock;
        input.value = String(maxStock);
        this.snackBar.open(
          `Ha alcanzado el stock máximo de ${maxStock} unidades.`,
          'Cerrar',
          {
            duration: 3000,
          },
        );
      }
      this.quantity = value;
    }
  }
}
