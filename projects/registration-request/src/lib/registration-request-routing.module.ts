import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegistrationRequestListComponent } from './component/registration-request-list/registration-request-list.component';

const routes: Routes = [
  {
    path: '',
    component: RegistrationRequestListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationRequestRoutingModule {}
