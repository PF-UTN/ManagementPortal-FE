import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  ViewContainerRef,
  OnInit,
  Input,
} from '@angular/core';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';

import { LateralDrawerConfig } from './model/lateral-drawer-config.model';
import { LateralDrawerService } from './service/lateral-drawer.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'mp-lateral-drawer',
  standalone: true,
  imports: [CommonModule, MatDrawerContainer, MatDrawer, ButtonComponent],
  templateUrl: './lateral-drawer.component.html',
  styleUrls: ['./lateral-drawer.component.scss'],
})
export class LateralDrawerComponent implements OnInit {
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  @ViewChild('drawerContainer', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  @Input() config: LateralDrawerConfig = {
    title: 'Default Title',
    footer: {
      firstButton: {
        text: 'Cancelar',
        click: () => {
          this.drawer.close();
        },
      },
    },
    size: 'small',
  };

  constructor(private drawerService: LateralDrawerService) {}

  ngOnInit(): void {
    this.drawerService.setDrawer(this.drawer, this.container);
  }

  closeDrawer() {
    this.drawer.close();
  }
}
