import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  LoginComponent,
  SignupComponent,
  ResetPasswordRequestComponent,
  ResetPasswordComponent,
} from './components';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'inicio-sesion', pathMatch: 'full' },
      { path: 'inicio-sesion', component: LoginComponent },
      { path: 'registro', component: SignupComponent },
      {
        path: 'solicitud-restablecimiento-clave',
        component: ResetPasswordRequestComponent,
      },
      { path: 'restablecimiento-clave/:token', component: ResetPasswordComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), LoginComponent, SignupComponent],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
