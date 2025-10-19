import { RoleGuard, RolesEnum } from '@Common';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

export const routes: Routes = [
  {
    path: 'autenticacion',
    loadChildren: () =>
      import('@Authentication').then((m) => m.AuthenticationRoutingModule),
  },
  {
    path: 'inicio',
    loadChildren: () => import('@Home').then((m) => m.HomeRoutingModule),
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Employee] },
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
  {
    path: 'productos',
    loadChildren: () => import('@Product').then((m) => m.ProductRoutingModule),
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Employee, RolesEnum.Client] },
  },
  {
    path: 'ordenes-compra',
    loadChildren: () =>
      import('@PurchaseOrder').then((m) => m.PurchaseOrderRoutingModule),
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Employee] },
  },
  {
    path: 'pedidos',
    loadChildren: () => import('@Order').then((m) => m.OrderRoutingModule),
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Client] },
  },
  {
    path: 'vehiculos',
    loadChildren: () => import('@Vehicle').then((m) => m.VehicleRoutingModule),
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Employee] },
  },
  {
    path: 'carrito',
    loadChildren: () => import('@Cart').then((m) => m.CartRoutingModule),
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Client, RolesEnum.Admin] },
  },
  {
    path: 'envios',
    loadChildren: () =>
      import('@Shipment').then((m) => m.ShipmentRoutingModule),
    canActivate: [RoleGuard],
    data: { admittedRoles: [RolesEnum.Client, RolesEnum.Admin] },
  },
  { path: 'unauthorized', pathMatch: 'full', component: UnauthorizedComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'inicio' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [RoleGuard],
  exports: [RouterModule],
})
export class AppRoutingModule {}
