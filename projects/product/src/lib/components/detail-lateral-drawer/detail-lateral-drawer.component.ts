import { LateralDrawerContainer, LateralDrawerService } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, effect, Input, signal } from '@angular/core';

import { ProductDetail } from '../../models/product-detail.model';

@Component({
  selector: 'lib-detail-lateral-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-lateral-drawer.component.html',
  styleUrl: './detail-lateral-drawer.component.scss',
})
export class DetailLateralDrawerComponent extends LateralDrawerContainer {
  @Input() data: ProductDetail;

  isLoading = signal(false);

  constructor(private readonly lateralDrawerService: LateralDrawerService) {
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
  closeDrawer(): void {
    this.lateralDrawerService.close();
  }
}
