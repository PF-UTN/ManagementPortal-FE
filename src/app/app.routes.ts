import { RoleGuard, RolesEnum } from '@Common';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@Authentication').then((m) => m.AuthenticationRoutingModule),
  },
  {
    path: 'inicio',
    loadChildren: () => import('@Home').then((m) => m.HomeRoutingModule),
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Employee, RolesEnum.Client] },
  },
  {
    path: 'solicitudes-registro',
    loadChildren: () =>
      import('@Registration-Request').then(
        (m) => m.RegistrationRequestRoutingModule,
      ),
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Employee] },
  },
  { path: 'unauthorized', pathMatch: 'full', component: UnauthorizedComponent },
  { path: '*', redirectTo: 'inicio', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [RoleGuard],
  exports: [RouterModule],
})
export class AppRoutingModule {}
