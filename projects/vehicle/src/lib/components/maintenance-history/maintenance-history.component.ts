import {
  TitleComponent,
  BackArrowComponent,
  DropdownButtonComponent,
  DropdownItem,
} from '@Common-UI';

import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';

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
  ],
  templateUrl: './maintenance-history.component.html',
  styleUrl: './maintenance-history.component.scss',
})
export class MaintenanceHistoryComponent implements OnInit {
  vehicleId!: string;
  dropdownItems: DropdownItem[] = [
    {
      label: 'Crear Mantenimiento',
      action: () => this.onCreateMaintenanceDrawer(),
    },
    {
      label: 'Crear Reparación',
      action: () => this.onCreateRepairDrawer(),
    },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {}

  onCreateMaintenancePlanDrawer() {
    // Logic to open the create/update maintenance plan drawer
  }

  onCreateMaintenanceDrawer() {
    // Logic to open the create/update maintenance drawer
  }

  onCreateRepairDrawer() {
    // Logic to open the create/update repair drawer
  }
}
