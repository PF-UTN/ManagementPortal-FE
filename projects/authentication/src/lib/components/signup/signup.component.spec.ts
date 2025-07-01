import { AuthService, mockClient, mockTown, NavBarService } from '@Common';

import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

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
    address: {
      street: '',
      streetNumber: 'abcdefg',
      town: 'abcdefg',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SignupComponent, NoopAnimationsModule],
      providers: [
        { provider: NavBarService, useValue: mockDeep<NavBarService>() },
        { provider: Router, useValue: mockDeep<Router>() },
        { provider: AuthService, useValue: mockDeep<AuthService>() },
        provideHttpClient(),
      ],
    });

    authService = TestBed.inject(AuthService);
    navBarService = TestBed.inject(NavBarService);

    fixture = TestBed.createComponent(SignupComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
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
        expect(emailControl.hasError('invalidEmail')).toBeTruthy();
      });
      it('should not set email error if email control is valid', () => {
        const emailControl = component.signupForm.controls.email;
        // Arrange
        emailControl.setValue(clientData.email);
        // Act & Assert
        expect(emailControl.hasError('invalidEmail')).toBeFalsy();
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
      it('should show error on confirmPassword control if passwords do not match', () => {
        const passwordControl = component.signupForm.controls.password;
        const confirmPasswordControl =
          component.signupForm.controls.confirmPassword;
        // Arrange
        passwordControl.setValue(clientData.password);
        confirmPasswordControl.setValue(clientInvalidData.password);
        // Act
        component.signupForm.updateValueAndValidity();
        // Assert
        expect(confirmPasswordControl.hasError('mismatch')).toBeTruthy();
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
        const birthdateControl = component.signupForm.controls.birthdate;
        // Arrange
        // Act & Assert
        expect(birthdateControl.hasError('required')).toBeTruthy();
      });
    });
    describe('Town fields validation', () => {
      it('should set town error if town control is empty', () => {
        const townControl = component.signupForm.controls.town;
        // Arrange
        townControl.setValue(null);
        // Act & Assert
        expect(townControl.hasError('required')).toBeTruthy();
      });
      it('should not set town error if town control is valid', () => {
        const townControl = component.signupForm.controls.town;
        // Arrange
        townControl.setValue(mockTown);
        // Act & Assert
        expect(townControl.hasError('required')).toBeFalsy();
      });

      it('should display town name and zipCode', () => {
        // Arrange
        const town = { id: 1, name: 'Rosario', zipCode: '2000', provinceId: 1 };
        // Act & Assert
        expect(component.displayTown(town)).toBe('Rosario (2000)');
      });

      it('should return empty string in displayTown if town is null', () => {
        // Arrange
        // Act & Assert
        expect(component.displayTown(null)).toBe('');
      });

      it('should require town field', () => {
        // Arrange
        component.ngOnInit();
        component.signupForm.controls.town.setValue(null);

        // Act
        const errors = component.signupForm.controls.town.errors;

        // Assert
        expect(errors).toBeTruthy();
        expect(errors!['required']).toBeTruthy();
      });

      it('should call townService.searchTowns with the name if value is a Town object', fakeAsync(() => {
        // Arrange
        const townServiceSpy = jest
          .spyOn(component['townService'], 'searchTowns')
          .mockReturnValue(of({ total: 0, results: [] }));

        component.ngOnInit();

        // Act
        component.filteredTowns$.subscribe();
        component.signupForm.controls.town.setValue(mockTown);
        tick(350);

        // Assert
        const calls = townServiceSpy.mock.calls.map((call) => call[0]);
        expect(calls).toContainEqual({
          searchText: mockTown.name,
          page: 1,
          pageSize: 5,
        });
      }));

      it('should call townService.searchTowns with empty string if value is null', fakeAsync(() => {
        // Arrange
        const townServiceSpy = jest
          .spyOn(component['townService'], 'searchTowns')
          .mockReturnValue(of({ total: 0, results: [] }));

        component.ngOnInit();

        // Act
        component.filteredTowns$.subscribe();
        component.signupForm.controls.town.setValue(null);
        tick(350);

        // Assert
        expect(townServiceSpy).toHaveBeenCalledWith({
          searchText: '',
          page: 1,
          pageSize: 5,
        });
      }));
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
      streetControl.setValue(clientData.address.street);
      // Act & Assert
      expect(streetControl.hasError('required')).toBeFalsy();
    });
  });

  describe('preventNonNumericInput', () => {
    it('should prevent non-numeric input', () => {
      // Arrange
      const event = {
        key: 'a',
        preventDefault: jest.fn(),
        ctrlKey: false,
      } as unknown as KeyboardEvent;

      // Act
      component.preventNonNumericInput(event);

      // Assert
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should allow numeric input', () => {
      // Arrange
      const event = {
        key: '1',
        preventDefault: jest.fn(),
        ctrlKey: false,
      } as unknown as KeyboardEvent;

      // Act
      component.preventNonNumericInput(event);

      // Assert
      expect(event.preventDefault).not.toHaveBeenCalled();
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
      streetNumberControl.setValue(clientData.address.streetNumber);
      // Act & Assert
      expect(streetNumberControl.hasError('required')).toBeFalsy();
    });

    it('should allow allowed keys', () => {
      // Arrange
      const allowedKeys: KeyboardEvent['key'][] = [
        'Backspace',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
      ];
      for (const key of allowedKeys) {
        const event = {
          key,
          preventDefault: jest.fn(),
          ctrlKey: false,
        } as unknown as KeyboardEvent;

        // Act
        component.preventNonNumericInput(event);

        // Assert
        expect(event.preventDefault).not.toHaveBeenCalled();
      }
    });

    it('should allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X', () => {
      // Arrange
      const ctrlKeys: KeyboardEvent['key'][] = ['a', 'c', 'v', 'x'];
      for (const key of ctrlKeys) {
        const event = {
          key,
          preventDefault: jest.fn(),
          ctrlKey: true,
        } as unknown as KeyboardEvent;

        // Act
        component.preventNonNumericInput(event);

        // Assert
        expect(event.preventDefault).not.toHaveBeenCalled();
      }
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
      taxCategoryControl.setValue(clientData.taxCategoryId);
      // Act & Assert
      expect(taxCategoryControl.hasError('required')).toBeFalsy();
    });
  });

  describe('Document Type field', () => {
    it('should translate document number error to Spanish', () => {
      // Arrange
      const msg = 'documentNumber must be longer than or equal to 7 characters';
      // Act & Assert
      expect(component['translateErrorMessage'](msg)).toBe(
        'El número de documento debe tener al menos 7 caracteres',
      );
    });

    it('should return the original message if no translation is found', () => {
      // Arrange
      const msg = 'Error desconocido';
      // Act & Assert
      expect(component['translateErrorMessage'](msg)).toBe(msg);
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
    it('should set companyName as required', () => {
      // Arrange
      const companyNameControl = component.signupForm.controls.companyName;
      companyNameControl.setValue('');
      // Act & Assert
      expect(companyNameControl.hasError('required')).toBeTruthy();
    });
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
      component.signupForm.controls.birthdate.setValue(clientData.birthdate);
      component.signupForm.controls.town.setValue(mockTown);
      component.signupForm.controls.street.setValue(clientData.address.street);
      component.signupForm.controls.streetNumber.setValue(
        clientData.address.streetNumber,
      );
      component.signupForm.controls.taxCategory.setValue(
        clientData.taxCategoryId,
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
      component.signupForm.setValue({
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email,
        password: clientData.password,
        confirmPassword: clientData.password,
        phone: clientData.phone,
        birthdate: clientData.birthdate,
        town: mockTown,
        street: clientData.address.street,
        streetNumber: clientData.address.streetNumber,
        taxCategory: clientData.taxCategoryId,
        documentType: clientData.documentType,
        documentNumber: clientData.documentNumber,
        companyName: clientData.companyName,
      });
      fixture.detectChanges();
      // Act
      component.onSubmit();
      // Assert
      expect(authServiceSpy).toHaveBeenCalledWith(clientData);
    });

    it('should show error message on failed signup', () => {
      // Arrange
      const errorMessage = 'Email is already in use';
      const errorResponse = new HttpErrorResponse({
        error: { message: errorMessage },
        status: 400,
        statusText: 'Bad Request',
      });

      jest
        .spyOn(authService, 'signUpAsync')
        .mockReturnValue(throwError(() => errorResponse));

      component.signupForm.setValue({
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email,
        password: clientData.password,
        confirmPassword: clientData.password,
        phone: clientData.phone,
        birthdate: clientData.birthdate,
        town: mockTown,
        street: clientData.address.street,
        streetNumber: clientData.address.streetNumber,
        taxCategory: clientData.taxCategoryId,
        documentType: clientData.documentType,
        documentNumber: clientData.documentNumber,
        companyName: clientData.companyName,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage).toBe(errorMessage);
    });

    it('should not call signup if form is invalid', () => {
      // Arrange
      const authServiceSpy = jest.spyOn(authService, 'signUpAsync');
      component.signupForm.reset();

      // Act
      component.onSubmit();

      // Assert
      expect(authServiceSpy).not.toHaveBeenCalled();
    });

    it('should set a default error message if backend error is empty', () => {
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: 400,
        statusText: 'Bad Request',
      });

      jest
        .spyOn(authService, 'signUpAsync')
        .mockReturnValue(throwError(() => errorResponse));

      component.signupForm.setValue({
        firstName: mockClient.firstName,
        lastName: mockClient.lastName,
        email: mockClient.email,
        password: mockClient.password,
        confirmPassword: mockClient.password,
        phone: mockClient.phone,
        birthdate: mockClient.birthdate,
        town: mockTown,
        street: mockClient.address.street,
        streetNumber: mockClient.address.streetNumber,
        taxCategory: mockClient.taxCategoryId,
        documentType: mockClient.documentType,
        documentNumber: mockClient.documentNumber,
        companyName: mockClient.companyName,
      });

      component.onSubmit();

      expect(component.errorMessage).toBe(
        'Http failure response for (unknown url): 400 Bad Request',
      );
    });
  });
  describe('Document Type Change Logic', () => {
    it('should set maxDocumentLength to 8 when documentType is DNI', () => {
      // Arrange
      const documentTypeControl = component.signupForm.controls.documentType;

      // Act
      documentTypeControl.setValue('DNI');

      // Assert
      expect(component.maxDocumentLength).toBe(8);
    });

    it('should add maxLength(8) validator when documentType is DNI', () => {
      // Arrange
      const documentTypeControl = component.signupForm.controls.documentType;
      const documentNumberControl =
        component.signupForm.controls.documentNumber;

      // Act
      documentTypeControl.setValue('DNI');
      documentNumberControl.setValue('123456789');

      // Assert
      expect(documentNumberControl.valid).toBe(false);
    });
    it('should set maxDocumentLength to 1 when documentType is CUIT', () => {
      // Arrange
      const documentTypeControl = component.signupForm.controls.documentType;

      // Act
      documentTypeControl.setValue('CUIT');

      // Assert
      expect(component.maxDocumentLength).toBe(11);
    });
    it('should add maxLength(11) validator when documentType is CUIT', () => {
      // Arrange
      const documentTypeControl = component.signupForm.controls.documentType;
      const documentNumberControl =
        component.signupForm.controls.documentNumber;

      // Act
      documentTypeControl.setValue('CUIT');
      documentNumberControl.setValue('123456789101');

      // Assert
      expect(documentNumberControl.valid).toBe(false);
    });
    it('should set maxDocumentLength to null when documentType is unknown', () => {
      // Arrange
      const documentTypeControl = component.signupForm.controls.documentType;

      // Act
      documentTypeControl.setValue('');

      // Assert
      expect(component.maxDocumentLength).toBeNull();
    });
  });
  describe('toggleVisibility', () => {
    it('should toggle signal from true to false', () => {
      // Arrange
      const testSignal = signal(true);

      // Act
      component.toggleVisibility(testSignal);

      // Assert
      expect(testSignal()).toBe(false);
    });

    it('should toggle signal from false to true', () => {
      // Arrange
      const testSignal = signal(false);

      // Act
      component.toggleVisibility(testSignal);

      // Assert
      expect(testSignal()).toBe(true);
    });

    it('should use error.message if error.error.message is undefined', () => {
      // Arrange
      const errorMessage =
        'Http failure response for (unknown url): 400 Bad Request';
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: 400,
        statusText: 'Bad Request',
      });

      jest
        .spyOn(authService, 'signUpAsync')
        .mockReturnValue(throwError(() => errorResponse));

      component.signupForm.setValue({
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email,
        password: clientData.password,
        confirmPassword: clientData.password,
        phone: clientData.phone,
        birthdate: clientData.birthdate,
        town: mockTown,
        street: clientData.address.street,
        streetNumber: clientData.address.streetNumber,
        taxCategory: clientData.taxCategoryId,
        documentType: clientData.documentType,
        documentNumber: clientData.documentNumber,
        companyName: clientData.companyName,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage).toBe(errorMessage);
    });
  });
});
