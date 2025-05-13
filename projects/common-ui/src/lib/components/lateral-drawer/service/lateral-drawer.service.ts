import {
  Injectable,
  ComponentRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Observable, Subject } from 'rxjs';

import { LateralDrawerComponent } from '../lateral-drawer.component';
import { LateralDrawerContainer } from '../model';
import { LateralDrawerConfig } from '../model/lateral-drawer-config.model';

@Injectable({
  providedIn: 'root',
})
export class LateralDrawerService {
  private drawer: MatDrawer;
  private container: ViewContainerRef;
  private drawerComponent: LateralDrawerComponent;
  private successSubject: Subject<void> = new Subject<void>();

  config: LateralDrawerConfig;

  setDrawer(drawer: MatDrawer, container: ViewContainerRef): void {
    this.drawer = drawer;
    this.container = container;
  }

  open<T extends LateralDrawerContainer>(
    component: Type<T>,
    data?: Partial<object>,
    config?: LateralDrawerConfig,
  ): Observable<void> {
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
      this.drawerComponent = this.container.injector.get(
        LateralDrawerComponent,
      );
      this.drawerComponent.config = config;
    }

    componentRef.instance.successEvent.subscribe(() => {
      this.successSubject.next();
      this.successSubject.complete();
    });

    this.drawer.open();

    this.successSubject = new Subject<void>();
    return this.successSubject.asObservable();
  }

  updateConfig(newConfig: Partial<LateralDrawerConfig>): void {
    if (!this.config || !this.drawerComponent) {
      throw new Error(
        'Drawer is not initialized or no config is set. Ensure the drawer is open before updating the config.',
      );
    }

    this.config = { ...this.config, ...newConfig };

    this.drawerComponent.config = this.config;
  }

  close(): void {
    if (this.drawer) {
      this.drawer.close();
    }
  }
}
