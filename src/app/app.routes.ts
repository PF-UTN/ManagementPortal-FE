import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from '../../projects/authentication/src/lib/components/signup/signup.component'; 
import { LoginComponent } from '../../projects/authentication/src/lib/components/login/login.component';

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
