import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes), HomeComponent],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
