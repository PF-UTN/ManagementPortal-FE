import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; 
import { ReactiveFormsModule } from '@angular/forms';  
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


 

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule,MatFormFieldModule,MatInputModule,MatIconModule, FormsModule, MatSelectModule,MatSlideToggleModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupForm: FormGroup;
  hidePassword = true;

  name: string = '';
  lastname: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  phone: string = '';
  birthdate: string = '';
  country: string = '';
  province: string = '';
  town: string = '';
  street: string = '';
  streetNumber: string = '';
  taxCategory: string = '';
  taxIdType: string = '';
  tax: string = '';
  companyName: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {

    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      lastname:['',Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword:['',[Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
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
    { validator: this.passwordsMatch });
  }


  passwordsMatch(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;  
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.authService.signUp(this.signupForm.value).subscribe((res) => {
        localStorage.setItem('token', res.token);
       // this.router.navigate(['/']);
      });
    }
  }
}
