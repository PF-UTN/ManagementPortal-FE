import { NavBarService } from '@Common';
import { LateralDrawerComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavBarComponent } from './components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavBarComponent,
    LateralDrawerComponent,
  ],
  providers: [NavBarService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  isNavBarVisible: Signal<boolean>;

  constructor(private navBarService: NavBarService) {}

  ngOnInit(): void {
    this.isNavBarVisible = this.navBarService.isNavBarVisible;
  }
}
