import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PurchaseOrderCreatedComponent } from './components/purchase-order-created/purchase-order-created.component';
import { PurchaseOrderListComponent } from './components/purchase-order-list/purchase-order-list.component';

const routes: Routes = [
  {
    path: '',
    component: PurchaseOrderListComponent,
  },
  {
    path: 'crear',
    component: PurchaseOrderCreatedComponent,
  },
  {
    path: 'modificar/:id',
    component: PurchaseOrderCreatedComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseOrderRoutingModule {}
