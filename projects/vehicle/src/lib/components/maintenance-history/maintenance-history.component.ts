import { downloadFileFromResponse } from '@Common';
import {
  TitleComponent,
  BackArrowComponent,
  DropdownButtonComponent,
  DropdownItem,
  ButtonComponent,
} from '@Common-UI';

import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';

import { VehicleListItem } from '../../models/vehicle-item.model';
import { VehicleService } from '../../services/vehicle.service';
import { MaintenanceListComponent } from '../maintenance-list/maintenance-list.component';
import { MaintenancePlanListComponent } from '../maintenance-plan-list/maintenance-plan-list.component';
import { MaintenanceRepairListComponent } from '../maintenance-repair-list/maintenance-repair-list.component';

@Component({
  selector: 'lib-maintenance-history',
  standalone: true,
  imports: [
    TitleComponent,
    BackArrowComponent,
    DropdownButtonComponent,
    MatTabsModule,
    MaintenancePlanListComponent,
    MaintenanceListComponent,
    MaintenanceRepairListComponent,
    ButtonComponent,
  ],
  templateUrl: './maintenance-history.component.html',
  styleUrl: './maintenance-history.component.scss',
})
export class MaintenanceHistoryComponent implements OnInit {
  vehicleId!: number;
  vehicle?: VehicleListItem;

  dropdownItems: DropdownItem[] = [
    {
      label: 'Crear Ítem de Mantenimiento',
      action: () => this.onCreateMaintenanceDrawer(),
    },
    {
      label: 'Crear Reparación',
      action: () => this.onCreateRepairDrawer(),
    },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly vehicleService: VehicleService,
  ) {}

  ngOnInit(): void {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('vehicleId'));
    this.vehicleService.getVehicleById(this.vehicleId).subscribe({
      next: (vehicle) => (this.vehicle = vehicle),
      error: () => (this.vehicle = undefined),
    });
  }

  onCreateMaintenancePlanDrawer() {
    // Logic to open the create/update maintenance plan drawer
  }

  onCreateMaintenanceDrawer() {
    // Logic to open the create/update maintenance drawer
  }

  onCreateRepairDrawer() {
    // Logic to open the create/update repair drawer
  }

  handleDownloadClick() {
    this.vehicleService
      .downloadMaintenanceHistory(this.vehicleId)
      .subscribe((response) => {
        downloadFileFromResponse(response, 'historial_mantenimiento.xlsx');
      });
  }
}
