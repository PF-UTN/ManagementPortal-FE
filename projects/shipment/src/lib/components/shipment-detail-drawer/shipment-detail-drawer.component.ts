import { LateralDrawerContainer, LoadingComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ShipmentDetail } from '../../models/shipment-deatil.model';
import { statusOptions } from '../../models/shipment-status-option.model';
import { ShipmentService } from '../../services/shipment.service';

@Component({
  selector: 'mp-shipment-detail-drawer',
  standalone: true,
  imports: [LoadingComponent, CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './shipment-detail-drawer.component.html',
  styleUrl: './shipment-detail-drawer.component.scss',
})
export class ShipmentDetailDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  shipmentId!: number;
  isLoading = signal(true);
  data = signal<ShipmentDetail | null>(null);

  constructor(private readonly shipmentService: ShipmentService) {
    super();
  }

  getStatusLabel(status: string): string {
    const found = statusOptions.find((opt) => opt.key === status);
    return found ? found.value : status;
  }

  ngOnInit(): void {
    this.shipmentService.getShipmentById(this.shipmentId).subscribe({
      next: (data: ShipmentDetail) => {
        this.data.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
