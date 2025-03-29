import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ButtonComponent, MpTitleComponent } from '@Common';
import { Client } from '../../models/client.model';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
const PHONE_REGEX = /^[+]?[0-9]{1,4}?[-.\\s]?([0-9]{1,3}[-.\\s]?){1,4}$/;

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
              MatSlideToggleModule,
              ButtonComponent,
              MpTitleComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  
  signupForm: FormGroup<{
    name: FormControl<string | null>;
    lastname: FormControl<string | null>;
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    phone: FormControl<string | null>;
    birthdate: FormControl<Date | null>;
    country: FormControl<string | null>;
    province: FormControl<string | null>;
    town: FormControl<string | null>;
    street: FormControl<string | null>;
    streetNumber: FormControl<number | null>;
    taxCategory: FormControl<number | null>;
    taxIdType: FormControl<number | null>;
    tax: FormControl<string | null>;
    companyName: FormControl<string | null>;
  }>;
  
  hidePassword = true;
  constructor(private fb: FormBuilder, protected authService: AuthService, private router: Router, private cdRef: ChangeDetectorRef) {

    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname:['',[Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(PASSWORD_REGEX)
      ]],
      confirmPassword:['',[Validators.required, Validators.minLength(8)]],
      phone: ['', [
        Validators.required,
        Validators.pattern(PHONE_REGEX)
      ]],
      birthdate: ['', Validators.required],
      country: ['',Validators.required],
      province: ['',Validators.required],
      town: ['',Validators.required],
      street: ['',Validators.required],
      streetNumber:['',Validators.required],
      taxCategory:['',Validators.required],
      taxIdType:['',Validators.required],
      tax:['',Validators.required],
      companyName:['',Validators.required],
      
    },
    { validator: this.passwordMatchValidator }
  );
    
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
      const client: Client = {
        name: this.signupForm.get('name')!.value!,
        lastname: this.signupForm.get('lastname')!.value!,
        email: this.signupForm.get('email')!.value!,
        password: this.signupForm.get('password')!.value!,
        phone: this.signupForm.get('phone')!.value!,
        birthdate: this.signupForm.get('birthdate')!.value!,
        country: this.signupForm.get('country')!.value!,
        province: this.signupForm.get('province')!.value!,
        town: this.signupForm.get('town')!.value!,
        street: this.signupForm.get('street')!.value!,
        streetNumber: this.signupForm.get('streetNumber')!.value!,
        taxCategory: this.signupForm.get('taxCategory')!.value!,
        taxIdType: this.signupForm.get('taxIdType')!.value!,
        tax: this.signupForm.get('tax')!.value!,
        companyName: this.signupForm.get('companyName')!.value!,
      };
      this.authService.signUpAndSaveToken(client).subscribe({
        next: (response) => { 
          this.router.navigate(['/login']); 
        },
        error: (error) => {
        }
      });
    }
  }
}
