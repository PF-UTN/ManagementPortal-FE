import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShipmentListComponent } from './components/shipment-list/shipment-list.component';

const routes: Routes = [
  {
    path: '',
    component: ShipmentListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShipmentRoutingModule {}
