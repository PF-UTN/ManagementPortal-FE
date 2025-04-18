import { ERROR_MESSAGES } from '@Common';

import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { throwError, of } from 'rxjs';

import { LoginComponent } from './login.component';
import { mockUser, mockInvalidUser } from '../../models/mock-data.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const userData = mockUser;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  describe('Form Validation', () => {
    it('should initialize form as invalid', () => {
      // Arrange
      // Act
      // Assert
      expect(component.loginForm.valid).toBeFalsy();
    });
  });
  describe('Email field validation', () => {
    it('should set email error if email control is empty', () => {
      const emailControl = component.loginForm.controls.email;
      // Arrange
      emailControl.setValue('');
      // Act & Assert
      expect(emailControl.hasError('required')).toBeTruthy();
    });
    it('should set email error if email control is invalid', () => {
      const emailControl = component.loginForm.get('email') as FormControl;
      // Arrange
      emailControl.setValue('invalid-email');
      // Act & Assert
      expect(emailControl.hasError('email')).toBeTruthy();
    });
    it('should not set email error if email control is valid', () => {
      const emailControl = component.loginForm.controls.email;
      // Arrange
      emailControl.setValue(userData.email);
      // Act & Assert
      expect(emailControl.hasError('email')).toBeFalsy();
      expect(emailControl.hasError('required')).toBeFalsy();
    });
  });

  describe('Password field validation', () => {
    it('should set password error if password control is empty', () => {
      const passwordControl = component.loginForm.controls.password;

      // Arrange
      passwordControl.setValue('');
      // Act & Assert
      expect(passwordControl.hasError('required')).toBeTruthy();
    });

    it('should set password error if password control is invalid', () => {
      const passwordControl = component.loginForm.controls.password;
      // Arrange
      passwordControl.setValue('12345');
      // Act & Assert
      expect(passwordControl.hasError('minlength')).toBeTruthy();
    });
  });

  describe('onSubmit Method', () => {
    it('should login successfully with valid credentials', () => {
      // Arrange
      const credentials = mockUser;
      const authServiceSpy = jest
        .spyOn(component['authService'], 'logInAsync')
        .mockReturnValue(of({ access_token: 'mockToken' }));
      component.loginForm.setValue(credentials);
      // Act
      component.onSubmit();
      // Assert
      expect(authServiceSpy).toHaveBeenCalledWith(credentials);
    });
    it('should show error message for invalid login', () => {
      // Arrange
      const credentials = mockInvalidUser;
      jest
        .spyOn(component['authService'], 'logInAsync')
        .mockReturnValue(
          throwError(
            () =>
              new HttpErrorResponse({
                status: 401,
                statusText: 'Unauthorized',
              }),
          ),
        );
      component.loginForm.setValue(credentials);
      // Act
      component.onSubmit();
      // Assert
      expect(component.errorMessage).toBe(ERROR_MESSAGES.invalidCredentials);
    });

    it('should handle unexpected errors gracefully', () => {
      // Arrange
      const credentials = mockInvalidUser;
      jest
        .spyOn(component['authService'], 'logInAsync')
        .mockReturnValue(
          throwError(
            () =>
              new HttpErrorResponse({
                status: 500,
                statusText: 'Server Error',
              }),
          ),
        );
      component.loginForm.setValue(credentials);
      // Act
      component.onSubmit();
      // Assert
      expect(component.errorMessage).toBe(ERROR_MESSAGES.unexpectedError);
    });

    describe('togglePasswordVisibility Method', () => {
      it('should initialize hidePassword as true', () => {
        // Arrange
        // Act
        // Assert
        expect(component.hidePassword).toBe(true);
      });

      it('should set hidePassword to false when toggled', () => {
        // Arrange
        expect(component.hidePassword).toBe(true);
        // Act
        component.togglePasswordVisibility();
        // Assert
        expect(component.hidePassword).toBe(false);
      });

      it('should set hidePassword to true when toggled again', () => {
        // Arrange
        component.hidePassword = false;
        // Act
        component.togglePasswordVisibility();
        // Assert
        expect(component.hidePassword).toBe(true);
      });
    });

    describe('navigateToRegister Method', () => {
      it('should navigate to register page', () => {
        // Arrange
        const routerSpy = jest.spyOn(component['router'], 'navigate');
        // Act
        component.navigateToRegister();
        // Assert
        expect(routerSpy).toHaveBeenCalledWith(['/signup']);
      });
    });
  });
});
