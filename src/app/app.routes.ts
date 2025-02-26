import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from '../app/auth/pages/signup/signup.component'; 
import { LoginComponent } from '../app/auth/pages/login/login.component';

export const routes: Routes = [
 {path: '', redirectTo:'', pathMatch:'full'},
 {path: 'signup', component: SignupComponent },
 {path: 'login', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], 
  exports: [RouterModule]
})
export class AppRoutingModule {}
