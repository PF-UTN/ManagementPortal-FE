import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule  } from '@angular/router'; 
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
  selector: 'app-signup',
  standalone: true,
  imports: [  CommonModule,
              ReactiveFormsModule, 
              RouterModule, 
              MatNativeDateModule, 
              MatDatepickerModule, 
              MatButtonModule,
              MatFormFieldModule,
              MatInputModule,
              MatIconModule, 
              FormsModule, 
              MatSelectModule,
              MatSlideToggleModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupForm: FormGroup;
  hidePassword = true;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private cdRef: ChangeDetectorRef) {

    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname:['',[Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')
      ]],
      confirmPassword:['',[Validators.required, Validators.minLength(8)]],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[+]?[0-9]{1,4}?[-.\\s]?([0-9]{1,3}[-.\\s]?){1,4}$')
      ]],
      birthdate: ['', Validators.required],
      country: ['',Validators.required],
      province: [''],
      town: [''],
      street: [''],
      streetNumber:[''],
      taxCategory:[''],
      taxIdType:[''],
      tax:[''],
      companyName:[''],
      
    },
    { validator: this.passwordMatchValidator });
    
  }


  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value
      ? null : { mismatch: true };}

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;  
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.authService.signUp(this.signupForm.value).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token); 
          this.router.navigate(['/login']); 
        },
        error: (error) => {
          console.error('Error al registrar el usuario', error);
        }
      });
    }
  }
}
