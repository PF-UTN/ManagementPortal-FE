import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrderListClientComponent } from '../public-api';
import { OrderListComponent } from './components/order-list/order-list.component';

const routes: Routes = [
  {
    path: 'cliente',
    component: OrderListClientComponent,
  },
  {
    path: '',
    component: OrderListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
