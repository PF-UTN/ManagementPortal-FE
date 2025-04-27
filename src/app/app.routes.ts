import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegistrationRequestListComponent } from './components/registration-request-list/registration-request-list.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@Authentication').then((m) => m.AuthenticationRoutingModule),
  },
  {
    path: 'inicio',
    loadChildren: () => import('@Home').then((m) => m.HomeRoutingModule),
  },
  {
    path: 'solicitudes-registro',
    pathMatch: 'full',
    component: RegistrationRequestListComponent,
  },
  { path: '*', redirectTo: 'inicio', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
