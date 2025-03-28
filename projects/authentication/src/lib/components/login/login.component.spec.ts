import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { FormControl } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,    
        LoginComponent,         
      ],
      providers: [
        provideHttpClient(),    
        provideRouter([]),      
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate email field', () => {
    const emailControl = component.loginForm.get('email') as FormControl;

    
    emailControl.setValue('');
    expect(emailControl.hasError('required')).toBeTruthy(); 


    emailControl.setValue('invalid-email');
    expect(emailControl.hasError('email')).toBeTruthy(); 

    
    emailControl.setValue('juan.perez@example.com');
    expect(emailControl.hasError('email')).toBeFalsy();
    expect(emailControl.hasError('required')).toBeFalsy();
  });

  it('should validate password field', () => {
    const passwordControl = component.loginForm.get('password') as FormControl;

  
    passwordControl.setValue('');
    expect(passwordControl.hasError('required')).toBeTruthy(); 

    passwordControl.setValue('12345');
    expect(passwordControl.hasError('minlength')).toBeTruthy(); 

    passwordControl.setValue('password123');
    expect(passwordControl.hasError('minlength')).toBeFalsy();
    expect(passwordControl.hasError('required')).toBeFalsy();
  });


});
