import { LateralDrawerContainer } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, signal, Input } from '@angular/core';

import { VehicleListItem } from '../../../../../common/src/models/vehicle/vehicle-item.model';

@Component({
  selector: 'mp-detail-vehicle-drawer',
  standalone: true,
  imports: [CommonModule],
  providers: [],
  templateUrl: './detail-vehicle-drawer.component.html',
  styleUrl: './detail-vehicle-drawer.component.scss',
})
export class DetailVehicleDrawerComponent extends LateralDrawerContainer {
  isLoading = signal(false);

  @Input() data: VehicleListItem;
}
