import { Component, Input } from '@angular/core';

import { PillStatus, PillStatusEnum } from './models/pill.status.model';

@Component({
  selector: 'mp-pill',
  templateUrl: './pill.component.html',
  styleUrls: ['./pill.component.scss'],
  standalone: true,
})
export class PillComponent {
  @Input() status: PillStatus = PillStatusEnum.Initial;

  get cssClass(): string {
    return `pill pill__${this.status}`;
  }
}
