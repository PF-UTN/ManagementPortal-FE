import { CartService } from '@Cart';
import { NavBarService } from '@Common';
import { CartBadgeButtonComponent, LateralDrawerComponent } from '@Common-UI';

import {
  CommonModule,
  DATE_PIPE_DEFAULT_OPTIONS,
  DatePipeConfig,
  registerLocaleData,
} from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { Component, computed, LOCALE_ID, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { NavBarComponent } from './components/nav-bar/nav-bar.component';

registerLocaleData(localeEsAr);
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavBarComponent,
    LateralDrawerComponent,
    CartBadgeButtonComponent,
  ],
  providers: [
    NavBarService,
    { provide: LOCALE_ID, useValue: 'es-AR' },
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { timezone: 'UTC' } as DatePipeConfig,
    },
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  isNavBarVisible: Signal<boolean>;
  isIndexPage: Signal<boolean>;
  cartCount = 0;

  constructor(
    private navBarService: NavBarService,
    private router: Router,
    private cartService: CartService,
  ) {
    const url$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    );
    const urlSignal = toSignal(url$, { initialValue: this.router.url });
    this.isIndexPage = computed(() => urlSignal() === '/');

    this.isNavBarVisible = this.navBarService.isNavBarVisible;
  }
  ngOnInit(): void {
    this.cartService.getCart().subscribe((cart) => {
      this.cartService.updateCart(cart);
    });
  }
}
