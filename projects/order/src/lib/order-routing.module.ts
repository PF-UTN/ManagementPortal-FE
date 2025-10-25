import { RoleGuard, RolesEnum } from '@Common';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrderListClientComponent } from '../public-api';
import { OrderFinalizeComponent } from './components/order-finalize/order-finalize.component';
import { OrderListComponent } from './components/order-list/order-list.component';

const routes: Routes = [
  {
    path: 'cliente',
    component: OrderListClientComponent,
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Client] },
  },
  {
    path: 'finalizar',
    component: OrderFinalizeComponent,
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Client] },
  },
  {
    path: '',
    component: OrderListComponent,
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Employee] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
