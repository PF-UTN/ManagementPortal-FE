import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrderListClientComponent } from '../public-api';

const routes: Routes = [
  {
    path: '',
    component: OrderListClientComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
