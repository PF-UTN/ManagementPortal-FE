import { Component, Input } from '@angular/core';

import { PillStatus } from './models/pill.status.model';

@Component({
  selector: 'mp-pill',
  templateUrl: './pill.component.html',
  styleUrls: ['./pill.component.scss'],
  standalone: true,
})
export class PillComponent {
  @Input() status: PillStatus = 'initial';

  get cssClass(): string {
    return `pill pill__${this.status}`;
  }
}
