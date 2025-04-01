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
  const clientData = mockClient;

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

    describe('Name field validation', () => {
      it('should set name error if name control is empty', () => {
        const nameControl = component.signupForm.get('firstName') as FormControl;
        // Arrange: Set name to empty
        nameControl.setValue('');
        // Act & Assert: Check required validation
        expect(nameControl.hasError('required')).toBeTruthy();
      });

      it('should set name error if name control is invalid', () => {
        const nameControl = component.signupForm.get('firstName') as FormControl;
      // Arrange: Set invalid name
      nameControl.setValue('J');
      // Act & Assert: Check name format validation
      expect(nameControl.hasError('minlength')).toBeTruthy();
    });

      it('should not set name error if name control is valid', () => {
        const nameControl = component.signupForm.get('firstName') as FormControl;
      // Arrange: Set valid name
      nameControl.setValue(clientData.firstName);
      // Act & Assert: No validation errors should appear
      expect(nameControl.hasError('required')).toBeFalsy();
      expect(nameControl.hasError('minlength')).toBeFalsy();
    });
    });

    describe('Lastname field validation', () => {
      it('should set lastname error if lastname control is empty', () => {
        const lastnameControl = component.signupForm.get('lastName') as FormControl;
        // Arrange: Set lastname to empty
        lastnameControl.setValue('');
        // Act & Assert: Check required validation
        expect(lastnameControl.hasError('required')).toBeTruthy();
      });

      it('should set lastname error if lastname control is invalid', () => {
        const lastnameControl = component.signupForm.get('lastName') as FormControl;
      // Arrange: Set invalid lastname
      lastnameControl.setValue('J');
      // Act & Assert: Check lastname format validation
      expect(lastnameControl.hasError('minlength')).toBeTruthy();
    });

      it('should not set lastname error if lastname control is valid', () => {
        const lastnameControl = component.signupForm.get('lastName') as FormControl;
      // Arrange: Set valid lastname
      lastnameControl.setValue(clientData.lastName);
      // Act & Assert: No validation errors should appear
      expect(lastnameControl.hasError('required')).toBeFalsy();
      expect(lastnameControl.hasError('minlength')).toBeFalsy();
    });
  });

  describe('Email field validation', () => {

    it('should set email error if email control is empty', () => {
      const emailControl = component.signupForm.get('email') as FormControl;

      // Arrange: Set email to empty
      emailControl.setValue('');
      // Act & Assert: Check required validation
      expect(emailControl.hasError('required')).toBeTruthy();
    });
    it('should set email error if email control is invalid', () => {
      const emailControl = component.signupForm.get('email') as FormControl;
      // Arrange: Set invalid email
      emailControl.setValue('invalid-email');
      // Act & Assert: Check email format validation
      expect(emailControl.hasError('email')).toBeTruthy();
    });
    it('should not set email error if email control is valid', () => {
      const emailControl = component.signupForm.get('email') as FormControl;
      // Arrange: Set valid email
      emailControl.setValue(clientData.email);
      // Act & Assert: No validation errors should appear
      expect(emailControl.hasError('email')).toBeFalsy();
      expect(emailControl.hasError('required')).toBeFalsy();
    });
  });
  describe('Password field validation', () => {
    it('should set password error if password control is empty', () => {
      const passwordControl = component.signupForm.get('password') as FormControl;

      // Arrange: Set password to empty
      passwordControl.setValue('');
      // Act & Assert: Check required validation
      expect(passwordControl.hasError('required')).toBeTruthy();
    });

    it('should set password error if password control is invalid', () => {
      const passwordControl = component.signupForm.get('password') as FormControl;
      // Arrange: Set password to a short value
      passwordControl.setValue('12345');
      // Act & Assert: Check minimum length validation
      expect(passwordControl.hasError('minlength')).toBeTruthy();
    });
    it('should set password error if password control does not match pattern', () => {
      const passwordControl = component.signupForm.get('password') as FormControl;
      // Arrange: Set password to a wrong pattern
      passwordControl.setValue('password');
      // Act & Assert: Check pattern validation
      expect(passwordControl.hasError('pattern')).toBeTruthy();
    });
    it('should not set password error if password control is valid', () => {
      const passwordControl = component.signupForm.get('password') as FormControl;
      // Arrange: Set password to a valid value
      passwordControl.setValue(clientData.password);
      // Act & Assert: No validation errors should appear
      expect(passwordControl.hasError('minlength')).toBeFalsy();
      expect(passwordControl.hasError('required')).toBeFalsy();
      expect(passwordControl.hasError('pattern')).toBeFalsy();
    });
    it('should show error message if password and confirmPassword do not match', () => {
      const passwordControl = component.signupForm.get('password') as FormControl;
      const confirmPasswordControl = component.signupForm.get('confirmPassword') as FormControl;
      
      // Arrange: Set different values for password and confirmPassword
      passwordControl.setValue(clientData.password);
      confirmPasswordControl.setValue('DifferentPassword123');
    
      // Act: Trigger form validation
      const form = component.signupForm;
      form.updateValueAndValidity();

      // Assert: Ensure the form has a mismatch error
      expect(form.hasError('mismatch')).toBeTruthy();

  });
});
  describe('Confirm phone field validation', () => {
    it('should set phone error if phone control is empty', () => {
      const phoneControl = component.signupForm.get('phone') as FormControl;

      // Arrange: Set phone to empty
      phoneControl.setValue('');
      // Act & Assert: Check required validation
      expect(phoneControl.hasError('required')).toBeTruthy();
    });

    it('should set phone error if phone control is invalid', () => {
      const phoneControl = component.signupForm.get('phone') as FormControl;
      // Arrange: Set invalid phone
      phoneControl.setValue('abcdefg');
      // Act & Assert: Check phone pattern validation
      expect(phoneControl.hasError('pattern')).toBeTruthy();
    });
    it('should not set phone error if phone control is valid', () => {
      const phoneControl = component.signupForm.get('phone') as FormControl;
      // Arrange: Set valid phone
      phoneControl.setValue(clientData.phone);
      // Act & Assert: No validation errors should appear
      expect(phoneControl.hasError('pattern')).toBeFalsy();
      expect(phoneControl.hasError('required')).toBeFalsy();
    });
    it('should set phone error if phone control does not match pattern', () => {
      const phoneControl = component.signupForm.get('phone') as FormControl;
      // Arrange: Set phone to a wrong pattern
      phoneControl.setValue('123456789@012345');
      // Act & Assert: Check pattern validation
      expect(phoneControl.hasError('pattern')).toBeTruthy();
    });
  });
  describe('Birthdate field validation', () => {
    it('should set birthdate error if birthdate control is empty', () => {
      const birthdateControl = component.signupForm.get('birthDate') as FormControl;

      // Arrange: Set birthdate to empty
      birthdateControl.setValue('');
      // Act & Assert: Check required validation
      expect(birthdateControl.hasError('required')).toBeTruthy();
    });
    it('should not set birthdate error if birthdate control is valid', () => {
      const birthdateControl = component.signupForm.get('birthDate') as FormControl;
      // Arrange: Set valid birthdate
      birthdateControl.setValue(clientData.birthDate);
      // Act & Assert: No validation errors should appear
      expect(birthdateControl.hasError('required')).toBeFalsy();
    });
  });

  describe('Country field validation', () => {

    it('should set country error if country control is empty', () => {
      const countryControl = component.signupForm.get('country') as FormControl;

      // Arrange: Set country to empty
      countryControl.setValue('');
      // Act & Assert: Check required validation
      expect(countryControl.hasError('required')).toBeTruthy();
    });
    it('should not set country error if country control is valid', () => {
      const countryControl = component.signupForm.get('country') as FormControl;
      // Arrange: Set valid country
      countryControl.setValue(clientData.country);
      // Act & Assert: No validation errors should appear
      expect(countryControl.hasError('required')).toBeFalsy();
    });

  });
  describe('Province field validation', () => {

    it('should set province error if province control is empty', () => {
      const provinceControl = component.signupForm.get('province') as FormControl;

      // Arrange: Set province to empty
      provinceControl.setValue('');
      // Act & Assert: Check required validation
      expect(provinceControl.hasError('required')).toBeTruthy();
    });
    it('should not set province error if province control is valid', () => {
      const provinceControl = component.signupForm.get('province') as FormControl;
      // Arrange: Set valid province
      provinceControl.setValue(clientData.province);
      // Act & Assert: No validation errors should appear
      expect(provinceControl.hasError('required')).toBeFalsy();
    });
  });
  describe('Town fields validation', () => {
    it('should set town error if town control is empty', () => {
      const townControl = component.signupForm.get('town') as FormControl;

      // Arrange: Set town to empty
      townControl.setValue('');
      // Act & Assert: Check required validation
      expect(townControl.hasError('required')).toBeTruthy();
    }); 

    it('should not set town error if town control is valid', () => {
      const townControl = component.signupForm.get('town') as FormControl;
      // Arrange: Set valid town
      townControl.setValue(clientData.town);
      // Act & Assert: No validation errors should appear
      expect(townControl.hasError('required')).toBeFalsy();
    });
  });
  describe('Street field validation', () => {
    it('should set street error if street control is empty', () => {
      const streetControl = component.signupForm.get('street') as FormControl;

      // Arrange: Set street to empty
      streetControl.setValue('');
      // Act & Assert: Check required validation
      expect(streetControl.hasError('required')).toBeTruthy();
    });

    it('should not set street error if street control is valid', () => {
      const streetControl = component.signupForm.get('street') as FormControl;
      // Arrange: Set valid street
      streetControl.setValue(clientData.street);
      // Act & Assert: No validation errors should appear
      expect(streetControl.hasError('required')).toBeFalsy();
    });
  });
  describe('Street Number field validation', () => {
    it('should set streetNumber error if streetNumber control is empty', () => {
      const streetNumberControl = component.signupForm.get('streetNumber') as FormControl;

      // Arrange: Set streetNumber to empty
      streetNumberControl.setValue('');
      // Act & Assert: Check required validation
      expect(streetNumberControl.hasError('required')).toBeTruthy();
    });

    it('should not set streetNumber error if streetNumber control is valid', () => {
      const streetNumberControl = component.signupForm.get('streetNumber') as FormControl;
      // Arrange: Set valid streetNumber
      streetNumberControl.setValue(clientData.streetNumber);
      // Act & Assert: No validation errors should appear
      expect(streetNumberControl.hasError('required')).toBeFalsy();
    });
  });
  describe('Tax Category field validation', () => {
    it('should set taxCategory error if taxCategory control is empty', () => {
      const taxCategoryControl = component.signupForm.get('taxCategory') as FormControl;

      // Arrange: Set taxCategory to empty
      taxCategoryControl.setValue('');
      // Act & Assert: Check required validation
      expect(taxCategoryControl.hasError('required')).toBeTruthy();
    });

    it('should not set taxCategory error if taxCategory control is valid', () => {
      const taxCategoryControl = component.signupForm.get('taxCategory') as FormControl;
      // Arrange: Set valid taxCategory
      taxCategoryControl.setValue(clientData.taxCategory);
      // Act & Assert: No validation errors should appear
      expect(taxCategoryControl.hasError('required')).toBeFalsy();
    });
  });
  describe('Tax ID Type field validation', () => {
    it('should set documentType error if documentType control is empty', () => {
      const documentTypeControl = component.signupForm.get('documentType') as FormControl;

      // Arrange: Set documentType to empty
      documentTypeControl.setValue('');
      // Act & Assert: Check required validation
      expect(documentTypeControl.hasError('required')).toBeTruthy();
    });
    it('should not set documentType error if documentType control is valid', () => {
      const documentTypeControl = component.signupForm.get('documentType') as FormControl;
      // Arrange: Set valid documentType
      documentTypeControl.setValue(clientData.documentType);
      // Act & Assert: No validation errors should appear
      expect(documentTypeControl.hasError('required')).toBeFalsy();
    });
  });
  describe('Tax field validation', () => {
    it('should set tax error if tax control is empty', () => {
      const taxControl = component.signupForm.get('documentNumber') as FormControl;

      // Arrange: Set tax to empty
      taxControl.setValue('');
      // Act & Assert: Check required validation
      expect(taxControl.hasError('required')).toBeTruthy();
    });
    it('should not set tax error if tax control is valid', () => {
      const taxControl = component.signupForm.get('documentNumber') as FormControl;
      // Arrange: Set valid tax
      taxControl.setValue(clientData.documentNumber);
      // Act & Assert: No validation errors should appear
      expect(taxControl.hasError('required')).toBeFalsy();
    });
  });
  describe('CompanyName field validation', () => {
    it('should set companyName error if companyName control is empty', () => {
      const companyNameControl = component.signupForm.get('companyName') as FormControl;

      // Arrange: Set companyName to empty
      companyNameControl.setValue('');
      // Act & Assert: Check required validation
      expect(companyNameControl.hasError('required')).toBeTruthy();
    });
    it('should not set companyName error if companyName control is valid', () => {
      const companyNameControl = component.signupForm.get('companyName') as FormControl;
      // Arrange: Set valid companyName
      companyNameControl.setValue(clientData.companyName);
      // Act & Assert: No validation errors should appear
      expect(companyNameControl.hasError('required')).toBeFalsy();
    });
  });

describe('Form submission', () => {
    it('should be valid if all fields are filled correctly', () => {
      const clientData = mockClient;

      // Arrange: Set valid form values
      component.signupForm.controls['firstName'].setValue(clientData.firstName);
      component.signupForm.controls['lastName'].setValue(clientData.lastName);
      component.signupForm.controls['email'].setValue(clientData.email);
      component.signupForm.controls['password'].setValue(clientData.password);
      component.signupForm.controls['confirmPassword'].setValue(clientData.password);
      component.signupForm.controls['phone'].setValue(clientData.phone);
      component.signupForm.controls['birthDate'].setValue(clientData.birthDate);
      component.signupForm.controls['country'].setValue(clientData.country);
      component.signupForm.controls['province'].setValue(clientData.province);
      component.signupForm.controls['town'].setValue(clientData.town);
      component.signupForm.controls['street'].setValue(clientData.street);
      component.signupForm.controls['streetNumber'].setValue(clientData.streetNumber);
      component.signupForm.controls['taxCategory'].setValue(clientData.taxCategory);
      component.signupForm.controls['documentType'].setValue(clientData.documentType);
      component.signupForm.controls['documentNumber'].setValue(clientData.documentNumber);
      component.signupForm.controls['companyName'].setValue(clientData.companyName);
      fixture.detectChanges();

      // Act & Assert: The form should be valid
      expect(component.signupForm.valid).toBeTruthy();
    });
});


  describe('onSubmit Method', () => {
    it('should call the signup method with the correct client data', () => {
      // Arrange: Prepare valid client data
      const clientData = mockClient;
      const authServiceSpy = jest.spyOn(component['authService'], 'signUpAsync').mockReturnValue(of({ token: 'mockToken' }));
      component.signupForm.setValue(clientData);
      fixture.detectChanges();
      // Act: Call onSubmit with valid client data
      component.onSubmit();

      // Assert: Expect router navigate to be called
      expect(authServiceSpy).toHaveBeenCalledWith(clientData);

  });

});
});
});
