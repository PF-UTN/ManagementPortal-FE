import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProductCreateComponent } from './components/product-created/product-create.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductListClientComponent } from './components/product-list-client/product-list-client.component';

const routes: Routes = [
  {
    path: '',
    component: ProductListComponent,
  },
  {
    path: 'crear',
    component: ProductCreateComponent,
  },
  {
    path: 'editar/:id',
    component: ProductCreateComponent,
  },
  {
    path: 'cliente',
    component: ProductListClientComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductRoutingModule {}
