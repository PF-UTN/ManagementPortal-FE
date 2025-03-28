import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { SignupComponent } from './signup.component';
import { FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import jasmine from 'jasmine'; 

describe('SignupComponent', () => {
  let component: SignupComponent;
  const mockAuthService = {
    signUpAsync: () => of({ token: 'mockToken' })
  };

  beforeEach(async () => {  
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,    
        SignupComponent,               
      ],
      providers: [
        provideHttpClient(),    
        provideRouter([]), 
        { provide: AuthService, useValue: mockAuthService }     
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid', () => {
    expect(component.signupForm.valid).toBeFalsy();
  });
  
  it('should validate name field', () => {
    const nameControl = component.signupForm.get('name') as FormControl;
  
    nameControl.setValue('');
    expect(nameControl.hasError('required')).toBeTruthy();
  
    nameControl.setValue('J');
    expect(nameControl.hasError('minlength')).toBeTruthy();
  
    nameControl.setValue('Jhon');
    expect(nameControl.valid).toBeTruthy();
  });

  it('should validate lastname field', () => {
    const nameControl = component.signupForm.get('lastname') as FormControl;
  
    nameControl.setValue('');
    expect(nameControl.hasError('required')).toBeTruthy();
  
    nameControl.setValue('D');
    expect(nameControl.hasError('minlength')).toBeTruthy();
  
    nameControl.setValue('Doe');
    expect(nameControl.valid).toBeTruthy();
  });

  it('should validate email field', () => {
    const emailControl = component.signupForm.get('email') as FormControl;
  
    emailControl.setValue('');
    expect(emailControl.hasError('required')).toBeTruthy();
  
    emailControl.setValue('invalid-email');
    expect(emailControl.hasError('email')).toBeTruthy();
  
    emailControl.setValue('juan.perez@example.com');
    expect(emailControl.valid).toBeTruthy();
  });
  
  it('should validate password field', () => {
    const passwordControl = component.signupForm.get('password') as FormControl;
  
    passwordControl.setValue('');
    expect(passwordControl.hasError('required')).toBeTruthy();
  
    passwordControl.setValue('12345');
    expect(passwordControl.hasError('minlength')).toBeTruthy();
  
    passwordControl.setValue('Password123');
    expect(passwordControl.hasError('pattern')).toBeFalsy();
  });

  it('should validate phone field', () => {
    const phoneControl = component.signupForm.get('phone');
    
    phoneControl?.setValue('');
    expect(phoneControl?.hasError('required')).toBeTruthy(); 
    
    phoneControl?.setValue('invalid-phone');
    expect(phoneControl?.hasError('pattern')).toBeTruthy(); 
    
    phoneControl?.setValue('+54123456789');
    expect(phoneControl?.valid).toBeTruthy(); 
  });
  
  it('should validate birthdate field', () => {
    const birthdateControl = component.signupForm.get('birthdate');
    
    birthdateControl?.setValue(null);
    expect(birthdateControl?.hasError('required')).toBeTruthy(); 
    
    birthdateControl?.setValue(new Date('2000-01-01'));
    expect(birthdateControl?.valid).toBeTruthy(); 
  });
  
  it('should validate country field', () => {
    const countryControl = component.signupForm.get('country');
    
    countryControl?.setValue('');
    expect(countryControl?.hasError('required')).toBeTruthy();
    
    countryControl?.setValue('Argentina');
    expect(countryControl?.valid).toBeTruthy(); 
  });
  
  it('should validate country field', () => {
    const countryControl = component.signupForm.get('country');
    
    countryControl?.setValue('');
    expect(countryControl?.hasError('required')).toBeTruthy(); 
    
    countryControl?.setValue('Argentina');
    expect(countryControl?.valid).toBeTruthy(); 
  });
  
  it('should validate province field', () => {
    const provinceControl = component.signupForm.get('province');
    
    provinceControl?.setValue('');
    expect(provinceControl?.hasError('required')).toBeTruthy(); 
    
    provinceControl?.setValue('Buenos Aires');
    expect(provinceControl?.valid).toBeTruthy();
  });
  
  it('should validate town field', () => {
    const townControl = component.signupForm.get('town');
    
    townControl?.setValue('');
    expect(townControl?.hasError('required')).toBeTruthy(); 
    
    townControl?.setValue('Rosario');
    expect(townControl?.valid).toBeTruthy(); 
  });
  
  it('should validate street field', () => {
    const streetControl = component.signupForm.get('street');
    
    streetControl?.setValue('');
    expect(streetControl?.hasError('required')).toBeTruthy(); 
    
    streetControl?.setValue('Main Street');
    expect(streetControl?.valid).toBeTruthy(); 
  });
  
  it('should validate streetNumber field', () => {
    const streetNumberControl = component.signupForm.get('streetNumber');
    
    streetNumberControl?.setValue(null);
    expect(streetNumberControl?.hasError('required')).toBeTruthy(); 
    
    streetNumberControl?.setValue(123);
    expect(streetNumberControl?.valid).toBeTruthy(); 
  });
  
  it('should validate taxCategory field', () => {
    const taxCategoryControl = component.signupForm.get('taxCategory');
    
    taxCategoryControl?.setValue(null);
    expect(taxCategoryControl?.hasError('required')).toBeTruthy(); 
    
    taxCategoryControl?.setValue(1);
    expect(taxCategoryControl?.valid).toBeTruthy(); 
  });
  

  it('should validate taxIdType field', () => {
    const taxIdTypeControl = component.signupForm.get('taxIdType');
    
    taxIdTypeControl?.setValue(null);
    expect(taxIdTypeControl?.hasError('required')).toBeTruthy();
    
    taxIdTypeControl?.setValue(1);
    expect(taxIdTypeControl?.valid).toBeTruthy(); 
  });
  
  it('should validate tax field', () => {
    const taxControl = component.signupForm.get('tax');
    
    taxControl?.setValue('');
    expect(taxControl?.hasError('required')).toBeTruthy(); 
    
    taxControl?.setValue('20-12345678-9');
    expect(taxControl?.valid).toBeTruthy(); 
  });
  
  it('should validate companyName field', () => {
    const companyNameControl = component.signupForm.get('companyName');
    
    companyNameControl?.setValue('');
    expect(companyNameControl?.hasError('required')).toBeTruthy();
    
    companyNameControl?.setValue('Mi Empresa');
    expect(companyNameControl?.valid).toBeTruthy(); 
  });
  
})

