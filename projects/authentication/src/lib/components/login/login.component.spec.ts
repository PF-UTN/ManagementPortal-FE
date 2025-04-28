import { ERROR_MESSAGES, NavBarService, KeyboardEventMock } from '@Common';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { throwError, of } from 'rxjs';

import { LoginComponent } from './login.component';
import { mockUser, mockInvalidUser } from '../../models/mock-data.model';
import { AuthService } from '../../services';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;
  let navBarService: NavBarService;
  const userData = mockUser;
  const mockAuthService = mockDeep<AuthService>();

  beforeEach(() => {
    mockAuthService.logInAsync.mockReturnValue(
      of({
        success: true,
        access_token: 'mockAccessToken',
      }),
    );

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent, BrowserAnimationsModule],
      providers: [
        { provide: NavBarService, useValue: mockDeep<NavBarService>() },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockDeep<Router>() },
        { provide: HttpClient, useValue: mockDeep<HttpClient>() },
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    navBarService = TestBed.inject(NavBarService);

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
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should set email error if email control is empty', () => {
      // Arrange
      const emailControl = component.loginForm.controls.email;
      emailControl.setValue('');

      // Act & Assert
      expect(emailControl.hasError('required')).toBeTruthy();
    });

    it('should set email error if email control is invalid', () => {
      // Arrange
      const emailControl = component.loginForm.get('email') as FormControl;
      emailControl.setValue('invalid-email');

      // Act & Assert
      expect(emailControl.hasError('invalidEmail')).toBeTruthy();
    });
    it('should not set email REGEX error if email control is valid', () => {
      const emailControl = component.loginForm.controls.email;
      // Arrange
      emailControl.setValue(userData.email);
      // Act & Assert
      expect(emailControl.hasError('invalidEmail')).toBeFalsy();
    });
    it('should not set email required error if email control is valid', () => {
      const emailControl = component.loginForm.controls.email;
      emailControl.setValue(userData.email);

      // Act & Assert
      expect(emailControl.hasError('required')).toBeFalsy();
    });
    it('should set invalidEmail error if customEmailValidator detects invalid email', () => {
      // Arrange
      const control = { value: 'invalid-email' } as AbstractControl;
      const validatorFn = component.customEmailValidator();

      // Act
      const result = validatorFn(control);

      // Assert
      expect(result).toEqual({ invalidEmail: true });
    });

    it('should return null if customEmailValidator detects valid email', () => {
      // Arrange
      const control = { value: mockUser.email } as AbstractControl;
      const validatorFn = component.customEmailValidator();

      // Act
      const result = validatorFn(control);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Password field validation', () => {
    it('should set password error if password control is empty', () => {
      // Arrange
      const passwordControl = component.loginForm.controls.password;
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
        .spyOn(authService, 'logInAsync')
        .mockReturnValue(of({ access_token: 'mockToken' }));

      component.loginForm.setValue(credentials);

      // Act
      component.onSubmit();
      // Assert
      expect(authServiceSpy).toHaveBeenCalledWith(credentials);
    });

    it('should navigate to home page on successful login', () => {
      // Arrange
      const credentials = mockUser;
      jest
        .spyOn(authService, 'logInAsync')
        .mockReturnValue(of({ access_token: 'mockToken' }));

      const routerSpy = jest.spyOn(router, 'navigate');

      component.loginForm.setValue(credentials);

      // Act
      component.onSubmit();

      // Assert
      expect(routerSpy).toHaveBeenCalledWith(['inicio']);
    });

    it('should call showNavBar from NavBarService on successful login', () => {
      // Arrange
      const credentials = mockUser;
      jest
        .spyOn(authService, 'logInAsync')
        .mockReturnValue(of({ access_token: 'mockToken' }));

      const navBarSpy = jest.spyOn(navBarService, 'showNavBar');

      component.loginForm.setValue(credentials);

      // Act
      component.onSubmit();

      // Assert
      expect(navBarSpy).toHaveBeenCalled();
    });

    it('should show error message for invalid login', () => {
      // Arrange
      const credentials = mockInvalidUser;
      jest.spyOn(authService, 'logInAsync').mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              statusText: 'Unauthorized',
              error: { message: ERROR_MESSAGES.invalidCredentials },
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
      jest.spyOn(authService, 'logInAsync').mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 500,
              statusText: 'Server Error',
              error: { message: ERROR_MESSAGES.unexpectedError },
            }),
        ),
      );
      component.loginForm.setValue(credentials);

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage).toBe(ERROR_MESSAGES.unexpectedError);
    });
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
      const routerSpy = jest.spyOn(router, 'navigate');

      // Act
      component.navigateToRegister();

      // Assert
      expect(routerSpy).toHaveBeenCalledWith(['signup']);
    });
  });

  describe('onKeydownEnter Method', () => {
    it('should prevent default action if Enter is pressed and form is invalid', () => {
      // Arrange
      const event = KeyboardEventMock('Enter');
      component.loginForm.controls.email.setValue('');
      component.loginForm.controls.password.setValue('');

      // Act
      component.onKeydownEnter(event);

      // Assert
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should not call onSubmit if Enter is pressed and form is invalid', () => {
      // Arrange
      const event = KeyboardEventMock('Enter');
      const onSubmitSpy = jest.spyOn(component, 'onSubmit');
      component.loginForm.controls.email.setValue('');
      component.loginForm.controls.password.setValue('');

      // Act
      component.onKeydownEnter(event);

      // Assert
      expect(onSubmitSpy).not.toHaveBeenCalled();
    });

    it('should call onSubmit if Enter is pressed and form is valid', () => {
      // Arrange
      const event = KeyboardEventMock('Enter');
      const onSubmitSpy = jest.spyOn(component, 'onSubmit');
      component.loginForm.controls.email.setValue(mockUser.email);
      component.loginForm.controls.password.setValue(mockUser.password);

      // Act
      component.onKeydownEnter(event);

      // Assert
      expect(onSubmitSpy).toHaveBeenCalled();
    });

    it('should do nothing if another key is pressed', () => {
      // Arrange
      const event = KeyboardEventMock('A');
      const onSubmitSpy = jest.spyOn(component, 'onSubmit');

      // Act
      component.onKeydownEnter(event);

      // Assert
      expect(onSubmitSpy).not.toHaveBeenCalled();
    });
  });
});
