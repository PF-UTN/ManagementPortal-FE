import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavBarService {
  isNavBarVisible = signal(true);

  showNavBar() {
    this.isNavBarVisible.set(true);
  }

  hideNavBar() {
    this.isNavBarVisible.set(false);
  }
}
