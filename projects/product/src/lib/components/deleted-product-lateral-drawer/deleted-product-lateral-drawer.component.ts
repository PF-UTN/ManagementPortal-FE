import {
  LateralDrawerService,
  LateralDrawerContainer,
  LoadingComponent,
  ModalComponent,
  ModalConfig,
} from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, signal, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ProductDetail } from '../../models/product-detail.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'mp-delete-lateral-drawer',
  standalone: true,
  imports: [LoadingComponent, CommonModule, MatSnackBarModule],
  templateUrl: './deleted-product-lateral-drawer.component.html',
  styleUrl: './deleted-product-lateral-drawer.component.scss',
})
export class DeletedProductLateralDrawerComponent extends LateralDrawerContainer {
  @Input() productId!: number;

  product: ProductDetail;
  deleteLoading = signal(false);
  isLoading = signal(true);

  constructor(
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly productService: ProductService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            click: () => this.confirmDelete(),
            text: 'Eliminar',
            loading: this.deleteLoading(),
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
        this.product = detail;
        this.isLoading.set(false);
      },
    });
  }

  closeDrawer() {
    this.lateralDrawerService.close();
  }

  confirmDelete() {
    const config: ModalConfig = {
      title: 'CONFIRMAR ELIMINACIÓN',
      message: '¿Estás seguro que deseas eliminar este producto?',
      confirmText: 'Sí, eliminar',
      cancelText: 'No',
    };

    const dialogRef = this.dialog.open(ModalComponent, {
      data: config,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onDelete();
      }
    });
  }

  onDelete() {
    this.deleteLoading.set(true);
    this.productService.deletedProduct(this.product.id).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.snackBar.open('Producto eliminado correctamente', 'Cerrar', {
          duration: 5000,
        });
        this.closeDrawer();
        this.emitSuccess();
      },
    });
  }
}
