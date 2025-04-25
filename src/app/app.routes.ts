import { SignupComponent, LoginComponent } from '@Authentication';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegistrationRequestListComponent } from './components/registration-request-list/registration-request-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registration-rquest', component: RegistrationRequestListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
