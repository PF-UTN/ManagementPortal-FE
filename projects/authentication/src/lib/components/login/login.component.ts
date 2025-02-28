import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../../authentication/src/lib/services/auth.service';
import { Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatNativeDateModule, MatDatepickerModule , MatButtonModule,MatFormFieldModule,MatInputModule,MatIconModule, FormsModule, MatSelectModule,MatSlideToggleModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup;
  hidePassword = true;
  
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')
      ]]

    })   
  }
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;  
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.logIn(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Se inició sesión exitosamente!', response);
          localStorage.setItem('token', response.token); 
          this.router.navigate(['/']); 
        },
        error: (error) => {
          console.error('Error al iniciar sesión', error);
        }
      });
    }
  }
}





