import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  LoginComponent,
  SignupComponent,
  ResetPasswordRequestComponent,
} from './components';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password-request', component: ResetPasswordRequestComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes), LoginComponent, SignupComponent],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
