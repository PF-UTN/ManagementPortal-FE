import {
  LateralDrawerService,
  LateralDrawerContainer,
  LoadingComponent,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, signal, Input } from '@angular/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ProductDetail } from '../../models/product-detail.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'mp-toggle-product-latearal-drawer',
  standalone: true,
  imports: [LoadingComponent, CommonModule, MatSnackBarModule],
  templateUrl: './toggle-product-latearal-drawer.component.html',
  styleUrl: './toggle-product-latearal-drawer.component.scss',
})
export class ToggleProductLatearalDrawerComponent extends LateralDrawerContainer {
  @Input() productId!: number;

  product = signal<ProductDetail | null>(null);
  toggleLoading = signal(false);
  isLoading = signal(true);

  constructor(
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly productService: ProductService,
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    effect(() => {
      this.product();
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            text: this.toggleButtonText,
            click: () => this.toggleProductState(),
            loading: this.toggleLoading(),
          },
          secondButton: {
            click: () => this.closeDrawer(),
            text: 'Cancelar',
          },
        },
      };
      this.lateralDrawerService.updateConfig(drawerConfig);
    });
  }

  ngOnInit(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: (detail) => {
        this.product.set(detail);
        this.isLoading.set(false);
      },
    });
  }

  get toggleButtonText(): string {
    const product = this.product();
    if (!product) return '';
    return product.enabled ? 'Pausar' : 'Reanudar';
  }

  closeDrawer() {
    this.lateralDrawerService.close();
  }

  toggleProductState() {
    this.toggleLoading.set(true);
    const product = this.product();
    if (!product) {
      this.toggleLoading.set(false);
      return;
    }
    const wasEnabled = product.enabled;
    this.productService
      .toggleProductStatus(this.productId, wasEnabled)
      .subscribe({
        next: () => {
          this.toggleLoading.set(false);
          const message = wasEnabled
            ? 'Producto pausado correctamente'
            : 'Producto reanudado correctamente';
          this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
          });
          this.closeDrawer();
          this.emitSuccess();
        },
      });
  }
}
