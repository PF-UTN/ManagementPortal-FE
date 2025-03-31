import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { FormControl } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mockClient } from '../../models/mock-data.model';
import { throwError, of } from 'rxjs';



describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;


  beforeEach( () => {
       TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,    
          SignupComponent,  
          BrowserAnimationsModule,       
        ],
        providers: [
          provideHttpClient(),    
          provideRouter([]),      
        ],
      }).compileComponents();
  
      fixture = TestBed.createComponent(SignupComponent);
      component = fixture.componentInstance;
    });

  describe('Form validation', () => {
    it('should initialize form as invalid', () => {
      // Arrange: No actions needed here, form is initialized
      // Act: Check if the form is invalid on initialization
      // Assert: Form should be invalid initially
      expect(component.signupForm.valid).toBeFalsy();
    });

    it('should validate name field', () => {
      const nameControl = component.signupForm.get('name') as FormControl;

      // Arrange: Set name to empty
      nameControl.setValue('');
      // Act & Assert: Check required validation
      expect(nameControl.hasError('required')).toBeTruthy();

      // Arrange: Set invalid name
      nameControl.setValue('J');
      // Act & Assert: Check name format validation
      expect(nameControl.hasError('minlength')).toBeTruthy();

      // Arrange: Set valid name
      nameControl.setValue('Juan');
      // Act & Assert: No validation errors should appear
      expect(nameControl.hasError('required')).toBeFalsy();
      expect(nameControl.hasError('minlength')).toBeFalsy();
    });

    it('should validate lastname field', () => {
      const lastnameControl = component.signupForm.get('lastname') as FormControl;

      // Arrange: Set lastname to empty
      lastnameControl.setValue('');
      // Act & Assert: Check required validation
      expect(lastnameControl.hasError('required')).toBeTruthy();

      // Arrange: Set invalid lastname
      lastnameControl.setValue('J');
      // Act & Assert: Check lastname format validation
      expect(lastnameControl.hasError('minlength')).toBeTruthy();

      // Arrange: Set valid lastname
      lastnameControl.setValue('Juan');
      // Act & Assert: No validation errors should appear
      expect(lastnameControl.hasError('required')).toBeFalsy();
      expect(lastnameControl.hasError('minlength')).toBeFalsy();
    });

    it('should validate email field', () => {
      const emailControl = component.signupForm.get('email') as FormControl;

      // Arrange: Set email to empty
      emailControl.setValue('');
      // Act & Assert: Check required validation
      expect(emailControl.hasError('required')).toBeTruthy();

      // Arrange: Set invalid email
      emailControl.setValue('invalid-email');
      // Act & Assert: Check email format validation
      expect(emailControl.hasError('email')).toBeTruthy();

      // Arrange: Set valid email
      emailControl.setValue('juan.perez@example.com');
      // Act & Assert: No validation errors should appear
      expect(emailControl.hasError('email')).toBeFalsy();
      expect(emailControl.hasError('required')).toBeFalsy();
    });

    it('should validate password field', () => {
      const passwordControl = component.signupForm.get('password') as FormControl;

      // Arrange: Set password to empty
      passwordControl.setValue('');
      // Act & Assert: Check required validation
      expect(passwordControl.hasError('required')).toBeTruthy();

      // Arrange: Set password to a short value
      passwordControl.setValue('12345');
      // Act & Assert: Check minimum length validation
      expect(passwordControl.hasError('minlength')).toBeTruthy();

      // Arrange: Set password to a wrong pattern
      passwordControl.setValue('password');
      // Act & Assert: Check pattern validation
      expect(passwordControl.hasError('pattern')).toBeTruthy();

      // Arrange: Set password to a valid value
      passwordControl.setValue('Password123');
      // Act & Assert: No validation errors should appear
      expect(passwordControl.hasError('minlength')).toBeFalsy();
      expect(passwordControl.hasError('required')).toBeFalsy();
      expect(passwordControl.hasError('pattern')).toBeFalsy();
    });
    it('should show error message if password and confirmPassword do not match', () => {
      const passwordControl = component.signupForm.get('password') as FormControl;
      const confirmPasswordControl = component.signupForm.get('confirmPassword') as FormControl;
      
      // Arrange: Set different values for password and confirmPassword
      passwordControl.setValue('Password123');
      confirmPasswordControl.setValue('DifferentPassword123');
    
      // Act: Trigger form validation
      const form = component.signupForm;
      form.updateValueAndValidity();

      // Assert: Ensure the form has a mismatch error
      expect(form.hasError('mismatch')).toBeTruthy();
    });

    it('should validate phone field', () => {
      const phoneControl = component.signupForm.get('phone') as FormControl;

      // Arrange: Set phone to empty
      phoneControl.setValue('');
      // Act & Assert: Check required validation
      expect(phoneControl.hasError('required')).toBeTruthy();

      // Arrange: Set invalid phone
      phoneControl.setValue('abcdefg');
      // Act & Assert: Check phone pattern validation
      expect(phoneControl.hasError('pattern')).toBeTruthy();

      // Arrange: Set valid phone
      phoneControl.setValue('1234567890');
      // Act & Assert: Check phone pattern validation
      expect(phoneControl.hasError('pattern')).toBeFalsy();
 
    });

    it('should validate birthdate field', () => {
      const birthdateControl = component.signupForm.get('birthdate') as FormControl;

      // Arrange: Set birthdate to empty
      birthdateControl.setValue('');
      // Act & Assert: Check required validation
      expect(birthdateControl.hasError('required')).toBeTruthy();

      // Arrange: Set valid birthdate
      birthdateControl.setValue(new Date());
      // Act & Assert: No validation errors should appear
      expect(birthdateControl.hasError('required')).toBeFalsy();
    });

    it('should validate country field', () => {
      const countryControl = component.signupForm.get('country') as FormControl;

      // Arrange: Set country to empty
      countryControl.setValue('');
      // Act & Assert: Check required validation
      expect(countryControl.hasError('required')).toBeTruthy();

      // Arrange: Set valid country
      countryControl.setValue('Argentina');
      // Act & Assert: No validation errors should appear
      expect(countryControl.hasError('required')).toBeFalsy();
    });

    it('should validate province field', () => {
      const provinceControl = component.signupForm.get('province') as FormControl;

      // Arrange: Set province to empty
      provinceControl.setValue('');
      // Act & Assert: Check required validation
      expect(provinceControl.hasError('required')).toBeTruthy();

      // Arrange: Set valid province
      provinceControl.setValue('Buenos Aires');
      // Act & Assert: No validation errors should appear
      expect(provinceControl.hasError('required')).toBeFalsy();
    });

    it('should validate town field', () => {
      const townControl = component.signupForm.get('town') as FormControl;

      // Arrange: Set town to empty
      townControl.setValue('');
      // Act & Assert: Check required validation
      expect(townControl.hasError('required')).toBeTruthy();

      // Arrange: Set valid town
      townControl.setValue('Rosario');
      // Act & Assert: No validation errors should appear
      expect(townControl.hasError('required')).toBeFalsy();
    });

    it('should validate street field', () => {
      const streetControl = component.signupForm.get('street') as FormControl;

      // Arrange: Set street to empty
      streetControl.setValue('');
      // Act & Assert: Check required validation
      expect(streetControl.hasError('required')).toBeTruthy();

      // Arrange: Set valid street
      streetControl.setValue('Main St');
      // Act & Assert: No validation errors should appear
      expect(streetControl.hasError('required')).toBeFalsy();
    });

    it('should validate streetNumber field', () => {
      const streetNumberControl = component.signupForm.get('streetNumber') as FormControl;

      // Arrange: Set streetNumber to empty
      streetNumberControl.setValue('');
      // Act & Assert: Check required validation
      expect(streetNumberControl.hasError('required')).toBeTruthy();

      // Arrange: Set valid streetNumber
      streetNumberControl.setValue(123);
      // Act & Assert: No validation errors should appear
      expect(streetNumberControl.hasError('required')).toBeFalsy();
    });

    it('should validate taxCategory field', () => {
      const taxCategoryControl = component.signupForm.get('taxCategory') as FormControl;

      // Arrange: Set taxCategory to empty
      taxCategoryControl.setValue('');
      // Act & Assert: Check required validation
      expect(taxCategoryControl.hasError('required')).toBeTruthy();

      // Arrange: Set valid taxCategory
      taxCategoryControl.setValue(1);
      // Act & Assert: No validation errors should appear
      expect(taxCategoryControl.hasError('required')).toBeFalsy();
    });

    it('should validate taxIdType field', () => {
      const taxIdTypeControl = component.signupForm.get('taxIdType') as FormControl;

      // Arrange: Set taxIdType to empty
      taxIdTypeControl.setValue('');
      // Act & Assert: Check required validation
      expect(taxIdTypeControl.hasError('required')).toBeTruthy();

      // Arrange: Set valid taxIdType
      taxIdTypeControl.setValue(1);
      // Act & Assert: No validation errors should appear
      expect(taxIdTypeControl.hasError('required')).toBeFalsy();
    });

    it('should validate tax field', () => {
      const taxControl = component.signupForm.get('tax') as FormControl;

      // Arrange: Set tax to empty
      taxControl.setValue('');
      // Act & Assert: Check required validation
      expect(taxControl.hasError('required')).toBeTruthy();

      // Arrange: Set valid tax
      taxControl.setValue('12345678');
      // Act & Assert: No validation errors should appear
      expect(taxControl.hasError('required')).toBeFalsy();
    });

    it('should validate companyName field', () => {
      const companyNameControl = component.signupForm.get('companyName') as FormControl;

      // Arrange: Set companyName to empty
      companyNameControl.setValue('');
      // Act & Assert: Check required validation
      expect(companyNameControl.hasError('required')).toBeTruthy();

      // Arrange: Set valid companyName
      companyNameControl.setValue('My Company');
      // Act & Assert: No validation errors should appear
      expect(companyNameControl.hasError('required')).toBeFalsy();
    });


    it('should be valid if all fields are filled correctly', () => {
      // Arrange: Set valid form values
      component.signupForm.controls['name'].setValue('John');
      component.signupForm.controls['lastname'].setValue('Doe');
      component.signupForm.controls['email'].setValue('john.doe@example.com');
      component.signupForm.controls['password'].setValue('Password123');
      component.signupForm.controls['confirmPassword'].setValue('Password123');
      component.signupForm.controls['phone'].setValue('1234567890');
      component.signupForm.controls['birthdate'].setValue(new Date());
      component.signupForm.controls['country'].setValue('Argentina');
      component.signupForm.controls['province'].setValue('Buenos Aires');
      component.signupForm.controls['town'].setValue('Rosario');
      component.signupForm.controls['street'].setValue('Street');
      component.signupForm.controls['streetNumber'].setValue(123);
      component.signupForm.controls['taxCategory'].setValue(1);
      component.signupForm.controls['taxIdType'].setValue(1);
      component.signupForm.controls['tax'].setValue('12345678');
      component.signupForm.controls['companyName'].setValue('My Company');
      fixture.detectChanges();

      // Act & Assert: The form should be valid
      expect(component.signupForm.valid).toBeTruthy();
    });
  });

  describe('onSubmit Method', () => {

    it('should call the signup method with the correct client data', () => {
      // Arrange: Prepare valid client data
      const clientData = mockClient;
      const authServiceSpy = jest.spyOn(component['authService'], 'signUpAndSaveToken').mockReturnValue(of({ token: 'mockToken' }));
      component.signupForm.setValue(clientData);
      fixture.detectChanges();
      // Act: Call onSubmit with valid client data
      component.onSubmit();

      // Assert: Expect router navigate to be called
      expect(authServiceSpy).toHaveBeenCalledWith(clientData);

  });

});
});
