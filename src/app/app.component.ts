import { NavBarService } from '@Common';
import { LateralDrawerComponent } from '@Common-UI';

import { CommonModule, registerLocaleData } from '@angular/common';
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
  ],
  providers: [NavBarService, { provide: LOCALE_ID, useValue: 'es-AR' }],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  isNavBarVisible: Signal<boolean>;
  isIndexPage: Signal<boolean>;

  constructor(
    private navBarService: NavBarService,
    private router: Router,
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
}
