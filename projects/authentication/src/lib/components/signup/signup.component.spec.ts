import { AuthService, mockClient, NavBarService } from '@Common';

import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { SignupComponent } from './signup.component';
describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let navBarService: NavBarService;
  let authService: AuthService;

  const clientData = mockClient;
  const clientInvalidData = {
    ...clientData,
    email: 'invalid-email',
    password: '12345',
    phone: 'abcdefg',
    taxCategory: '',
    documentType: '',
    documentNumber: '',
    companyName: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SignupComponent, BrowserAnimationsModule],
      providers: [
        { provider: NavBarService, useValue: mockDeep<NavBarService>() },
        { provider: Router, useValue: mockDeep<Router>() },
        { provider: AuthService, useValue: mockDeep<AuthService>() },
        provideHttpClient(),
      ],
    });

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;

    navBarService = TestBed.inject(NavBarService);
    authService = TestBed.inject(AuthService);

    fixture.detectChanges();
  });

  describe('OnInit', () => {
    it('should hide navBar', () => {
      // Arrange
      const navBarServiceSpy = jest.spyOn(navBarService, 'hideNavBar');

      // Act
      component.ngOnInit();

      // Assert
      expect(navBarServiceSpy).toHaveBeenCalled();
    });

    it('should initialize form as invalid', () => {
      // Arrange
      // Act
      // Assert
      expect(component.signupForm.valid).toBeFalsy();
    });

    it('should initialize form as invalid', () => {
      // Arrange
      // Act
      // Assert
      expect(component.signupForm.valid).toBeFalsy();
    });

    describe('Name field validation', () => {
      it('should set name error if name control is empty', () => {
        const nameControl = component.signupForm.controls.firstName;
        // Arrange
        nameControl.setValue('');
        // Act & Assert
        expect(nameControl.hasError('required')).toBeTruthy();
      });

      it('should set name error if name control is invalid', () => {
        const nameControl = component.signupForm.controls.firstName;
        // Arrange
        nameControl.setValue('J');
        // Act & Assert
        expect(nameControl.hasError('minlength')).toBeTruthy();
      });

      it('should not set name error if name control is valid', () => {
        const nameControl = component.signupForm.controls.firstName;
        // Arrange
        nameControl.setValue(clientData.firstName);
        // Act & Assert
        expect(nameControl.hasError('required')).toBeFalsy();
        expect(nameControl.hasError('minlength')).toBeFalsy();
      });
    });

    describe('Lastname field validation', () => {
      it('should set lastname error if lastname control is empty', () => {
        const lastnameControl = component.signupForm.controls.lastName;
        // Arrange
        lastnameControl.setValue('');
        // Act & Assert
        expect(lastnameControl.hasError('required')).toBeTruthy();
      });

      it('should set lastname error if lastname control is invalid', () => {
        const lastnameControl = component.signupForm.controls.lastName;
        // Arrange
        lastnameControl.setValue('J');
        // Act & Assert
        expect(lastnameControl.hasError('minlength')).toBeTruthy();
      });

      it('should not set lastname error if lastname control is valid', () => {
        const lastnameControl = component.signupForm.controls.lastName;
        // Arrange
        lastnameControl.setValue(clientData.lastName);
        // Act & Assert
        expect(lastnameControl.hasError('required')).toBeFalsy();
        expect(lastnameControl.hasError('minlength')).toBeFalsy();
      });
    });

    describe('Email field validation', () => {
      it('should set email error if email control is empty', () => {
        const emailControl = component.signupForm.controls.email;
        // Arrange
        emailControl.setValue('');
        // Act & Assert
        expect(emailControl.hasError('required')).toBeTruthy();
      });
      it('should set email error if email control is invalid', () => {
        const emailControl = component.signupForm.controls.email;
        // Arrange
        emailControl.setValue('invalid-email');
        // Act & Assert
        expect(emailControl.hasError('email')).toBeTruthy();
      });
      it('should not set email error if email control is valid', () => {
        const emailControl = component.signupForm.controls.email;
        // Arrange
        emailControl.setValue(clientData.email);
        // Act & Assert
        expect(emailControl.hasError('email')).toBeFalsy();
        expect(emailControl.hasError('required')).toBeFalsy();
      });
    });

    describe('Password field validation', () => {
      it('should set password error if password control is empty', () => {
        const passwordControl = component.signupForm.controls.password;
        // Arrange
        passwordControl.setValue('');
        // Act & Assert
        expect(passwordControl.hasError('required')).toBeTruthy();
      });

      it('should set password error if password control is invalid', () => {
        const passwordControl = component.signupForm.controls.password;
        // Arrange
        passwordControl.setValue('12345');
        // Act & Assert
        expect(passwordControl.hasError('minlength')).toBeTruthy();
      });
      it('should set password error if password control does not match pattern', () => {
        const passwordControl = component.signupForm.controls.password;
        // Arrange
        passwordControl.setValue('password');
        // Act & Assert
        expect(passwordControl.hasError('pattern')).toBeTruthy();
      });

      it('should not set password error if password control is valid', () => {
        const passwordControl = component.signupForm.controls.password;
        // Arrange
        passwordControl.setValue(clientData.password);
        // Act & Assert
        expect(passwordControl.hasError('minlength')).toBeFalsy();
        expect(passwordControl.hasError('required')).toBeFalsy();
        expect(passwordControl.hasError('pattern')).toBeFalsy();
      });
      it('should show error message if password and confirmPassword do not match', () => {
        const passwordControl = component.signupForm.controls.password;
        const confirmPasswordControl =
          component.signupForm.controls.confirmPassword;
        // Arrange
        passwordControl.setValue(clientData.password);
        confirmPasswordControl.setValue(clientInvalidData.password);
        // Act
        const form = component.signupForm;
        form.updateValueAndValidity();
        // Assert
        expect(form.hasError('mismatch')).toBeTruthy();
      });
    });
    describe('Confirm phone field validation', () => {
      it('should set phone error if phone control is empty', () => {
        const phoneControl = component.signupForm.controls.phone;
        // Arrange
        phoneControl.setValue('');
        // Act & Assert
        expect(phoneControl.hasError('required')).toBeTruthy();
      });
      it('should set phone error if phone control is invalid', () => {
        const phoneControl = component.signupForm.controls.phone;
        // Arrange
        phoneControl.setValue(clientInvalidData.phone);
        // Act & Assert
        expect(phoneControl.hasError('pattern')).toBeTruthy();
      });
      it('should not set phone error if phone control is valid', () => {
        const phoneControl = component.signupForm.controls.phone;
        // Arrange
        phoneControl.setValue(clientData.phone);
        // Act & Assert
        expect(phoneControl.hasError('pattern')).toBeFalsy();
        expect(phoneControl.hasError('required')).toBeFalsy();
      });
      it('should set phone error if phone control does not match pattern', () => {
        const phoneControl = component.signupForm.controls.phone;
        // Arrange
        phoneControl.setValue('123456789@012345');
        // Act & Assert
        expect(phoneControl.hasError('pattern')).toBeTruthy();
      });
    });
    describe('Birthdate field validation', () => {
      it('should set birthdate error if birthdate control is empty', () => {
        const birthdateControl = component.signupForm.controls.birthDate;
        // Arrange
        // Act & Assert
        expect(birthdateControl.hasError('required')).toBeTruthy();
      });
      it('should not set birthdate error if birthdate control is valid', () => {
        const birthdateControl = component.signupForm.controls.birthDate;
        // Arrange
        birthdateControl.setValue(clientData.birthDate);
        // Act & Assert
        expect(birthdateControl.hasError('required')).toBeFalsy();
      });
    });

    describe('Country field validation', () => {
      it('should set country error if country control is empty', () => {
        const countryControl = component.signupForm.controls.country;
        // Arrange
        countryControl.setValue('');
        // Act & Assert
        expect(countryControl.hasError('required')).toBeTruthy();
      });
      it('should not set country error if country control is valid', () => {
        const countryControl = component.signupForm.controls.country;
        // Arrange
        countryControl.setValue(clientData.country);
        // Act & Assert
        expect(countryControl.hasError('required')).toBeFalsy();
      });
    });
    describe('Province field validation', () => {
      it('should set province error if province control is empty', () => {
        const provinceControl = component.signupForm.controls.province;
        // Arrange
        provinceControl.setValue('');
        // Act & Assert
        expect(provinceControl.hasError('required')).toBeTruthy();
      });
      it('should not set province error if province control is valid', () => {
        const provinceControl = component.signupForm.controls.province;
        // Arrange
        provinceControl.setValue(clientData.province);
        // Act & Assert
        expect(provinceControl.hasError('required')).toBeFalsy();
      });
    });
    describe('Town fields validation', () => {
      it('should set town error if town control is empty', () => {
        const townControl = component.signupForm.controls.town;
        // Arrange
        townControl.setValue('');
        // Act & Assert
        expect(townControl.hasError('required')).toBeTruthy();
      });
      it('should not set town error if town control is valid', () => {
        const townControl = component.signupForm.controls.town;
        // Arrange
        townControl.setValue(clientData.town);
        // Act & Assert
        expect(townControl.hasError('required')).toBeFalsy();
      });
    });
    describe('Street field validation', () => {
      it('should set street error if street control is empty', () => {
        const streetControl = component.signupForm.controls.street;
        // Arrange
        streetControl.setValue('');
        // Act & Assert
        expect(streetControl.hasError('required')).toBeTruthy();
      });

      it('should not set street error if street control is valid', () => {
        const streetControl = component.signupForm.controls.street;
        // Arrange
        streetControl.setValue(clientData.street);
        // Act & Assert
        expect(streetControl.hasError('required')).toBeFalsy();
      });
    });
    describe('Street Number field validation', () => {
      it('should set streetNumber error if streetNumber control is empty', () => {
        const streetNumberControl = component.signupForm.controls.streetNumber;
        // Arrange
        // Act & Assert
        expect(streetNumberControl.hasError('required')).toBeTruthy();
      });

      it('should not set streetNumber error if streetNumber control is valid', () => {
        const streetNumberControl = component.signupForm.controls.streetNumber;
        // Arrange
        streetNumberControl.setValue(clientData.streetNumber);
        // Act & Assert
        expect(streetNumberControl.hasError('required')).toBeFalsy();
      });
    });
    describe('Tax Category field validation', () => {
      it('should set taxCategory error if taxCategory control is empty', () => {
        const taxCategoryControl = component.signupForm.controls.taxCategory;
        // Arrange
        // Act & Assert
        expect(taxCategoryControl.hasError('required')).toBeTruthy();
      });

      it('should not set taxCategory error if taxCategory control is valid', () => {
        const taxCategoryControl = component.signupForm.controls.taxCategory;
        // Arrange
        taxCategoryControl.setValue(clientData.taxCategory);
        // Act & Assert
        expect(taxCategoryControl.hasError('required')).toBeFalsy();
      });
    });
    describe('Tax ID Type field validation', () => {
      it('should set documentType error if documentType control is empty', () => {
        const documentTypeControl = component.signupForm.controls.documentType;
        // Arrange
        // Act & Assert
        expect(documentTypeControl.hasError('required')).toBeTruthy();
      });
      it('should not set documentType error if documentType control is valid', () => {
        const documentTypeControl = component.signupForm.controls.documentType;
        // Arrange
        documentTypeControl.setValue(clientData.documentType);
        // Act & Assert
        expect(documentTypeControl.hasError('required')).toBeFalsy();
      });
    });
    describe('Tax field validation', () => {
      it('should set tax error if tax control is empty', () => {
        const taxControl = component.signupForm.controls.documentNumber;
        // Arrange
        taxControl.setValue(clientInvalidData.documentNumber);
        // Act & Assert
        expect(taxControl.hasError('required')).toBeTruthy();
      });
      it('should not set tax error if tax control is valid', () => {
        const taxControl = component.signupForm.controls.documentNumber;
        // Arrange
        taxControl.setValue(clientData.documentNumber);
        // Act & Assert
        expect(taxControl.hasError('required')).toBeFalsy();
      });
    });
    describe('CompanyName field validation', () => {
      it('should set companyName error if companyName control is empty', () => {
        const companyNameControl = component.signupForm.controls.companyName;
        // Arrange
        companyNameControl.setValue('');
        // Act & Assert
        expect(companyNameControl.hasError('required')).toBeTruthy();
      });
      it('should not set companyName error if companyName control is valid', () => {
        const companyNameControl = component.signupForm.controls.companyName;
        // Arrange
        companyNameControl.setValue(clientData.companyName);
        // Act & Assert
        expect(companyNameControl.hasError('required')).toBeFalsy();
      });
    });

    describe('Form submission', () => {
      it('should be valid if all fields are filled correctly', () => {
        const clientData = mockClient;
        // Arrange
        component.signupForm.controls.firstName.setValue(clientData.firstName);
        component.signupForm.controls.lastName.setValue(clientData.lastName);
        component.signupForm.controls.email.setValue(clientData.email);
        component.signupForm.controls.password.setValue(clientData.password);
        component.signupForm.controls.confirmPassword.setValue(
          clientData.password,
        );
        component.signupForm.controls.phone.setValue(clientData.phone);
        component.signupForm.controls.birthDate.setValue(clientData.birthDate);
        component.signupForm.controls.country.setValue(clientData.country);
        component.signupForm.controls.province.setValue(clientData.province);
        component.signupForm.controls.town.setValue(clientData.town);
        component.signupForm.controls.street.setValue(clientData.street);
        component.signupForm.controls.streetNumber.setValue(
          clientData.streetNumber,
        );
        component.signupForm.controls.taxCategory.setValue(
          clientData.taxCategory,
        );
        component.signupForm.controls.documentType.setValue(
          clientData.documentType,
        );
        component.signupForm.controls.documentNumber.setValue(
          clientData.documentNumber,
        );
        component.signupForm.controls.companyName.setValue(
          clientData.companyName,
        );
        fixture.detectChanges();
        // Act & Assert
        expect(component.signupForm.valid).toBeTruthy();
      });
    });
    describe('onSubmit Method', () => {
      it('should call the signup method with the correct client data', () => {
        // Arrange
        const clientData = mockClient;
        const authServiceSpy = jest
          .spyOn(authService, 'signUpAsync')
          .mockReturnValue(of({ access_token: 'mockToken' }));
        component.signupForm.setValue(clientData);
        fixture.detectChanges();
        // Act
        component.onSubmit();
        // Assert
        expect(authServiceSpy).toHaveBeenCalledWith(clientData);
      });
    });
    describe('Document Type Change Logic', () => {
      it('should set maxDocumentLength to 8 when documentType is DNI', () => {
        const documentTypeControl = component.signupForm.controls.documentType;
        documentTypeControl.setValue('DNI');
        expect(component.maxDocumentLength).toBe(8);
      });

      it('should add maxLength(8) validator when documentType is DNI', () => {
        const documentTypeControl = component.signupForm.controls.documentType;
        const documentNumberControl =
          component.signupForm.controls.documentNumber;

        documentTypeControl.setValue('DNI');
        documentNumberControl.setValue('123456789');

        expect(documentNumberControl.valid).toBe(false);
      });
      it('should set maxDocumentLength to null when documentType is unknown', () => {
        const documentTypeControl = component.signupForm.controls.documentType;
        documentTypeControl.setValue('');
        expect(component.maxDocumentLength).toBeNull();
      });
    });
    describe('toggleVisibility', () => {
      it('should toggle signal from true to false', () => {
        const testSignal = signal(true);

        component.toggleVisibility(testSignal);

        expect(testSignal()).toBe(false);
      });

      it('should toggle signal from false to true', () => {
        const testSignal = signal(false);

        component.toggleVisibility(testSignal);

        expect(testSignal()).toBe(true);
      });
    });
  });
});
