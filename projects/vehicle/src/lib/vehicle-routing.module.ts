import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateMaintenancePlanComponent } from './components/create-maintenance-plan/create-maintenance-plan.component';
import { MaintenanceHistoryComponent } from './components/maintenance-history/maintenance-history.component';
import { VehicleListComponent } from './components/vehicle-list/vehicle-list.component';

const routes: Routes = [
  {
    path: '',
    component: VehicleListComponent,
  },
  {
    path: ':vehicleId/mantenimiento',
    component: MaintenanceHistoryComponent,
  },
  {
    path: ':vehicleId/mantenimiento/crear-plan-mantenimiento',
    component: CreateMaintenancePlanComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicleRoutingModule {}
