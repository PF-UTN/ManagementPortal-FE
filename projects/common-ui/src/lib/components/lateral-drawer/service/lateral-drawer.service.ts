import {
  Injectable,
  ComponentRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

import { LateralDrawerComponent } from '../lateral-drawer.component';
import { LateralDrawerConfig } from '../model/lateral-drawer-config.model';

@Injectable({
  providedIn: 'root',
})
export class LateralDrawerService {
  private drawer: MatDrawer;
  private container: ViewContainerRef;
  config: LateralDrawerConfig;

  setDrawer(drawer: MatDrawer, container: ViewContainerRef): void {
    this.drawer = drawer;
    this.container = container;
  }

  open<T extends object>(
    component: Type<T>,
    data?: Partial<T>,
    config?: LateralDrawerConfig,
  ): void {
    if (!this.drawer || !this.container) {
      throw new Error(
        'Drawer or container is not set. Ensure LateralDrawerComponent is initialized.',
      );
    }

    this.container.clear();

    const componentRef: ComponentRef<T> =
      this.container.createComponent(component);

    if (data) {
      Object.assign(componentRef.instance, data);
    }

    if (config) {
      this.config = config;
      const drawerComponent = this.container.injector.get(
        LateralDrawerComponent,
      );
      drawerComponent.config = config;
    }

    this.drawer.open();
  }

  close(): void {
    if (this.drawer) {
      this.drawer.close();
    }
  }
}
