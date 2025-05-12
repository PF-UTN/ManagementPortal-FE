import { AuthService, NavBarService } from '@Common';
import { mockUser } from '@Common';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { ResetPasswordRequestComponent } from './reset-password-request.component';

describe('ResetPasswordRequestComponent', () => {
  let component: ResetPasswordRequestComponent;
  let fixture: ComponentFixture<ResetPasswordRequestComponent>;
  let authService: AuthService;
  let navBarService: NavBarService;
  const userData = mockUser;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ResetPasswordRequestComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: mockDeep<AuthService>() },
        { provide: Router, useValue: mockDeep<Router>() },
        { provide: NavBarService, useValue: mockDeep<NavBarService>() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordRequestComponent);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService);
    navBarService = TestBed.inject(NavBarService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should hide navBar', () => {
      //Arrange
      const navBarServiceSpy = jest.spyOn(navBarService, 'hideNavBar');
      //Act
      component.ngOnInit();
      //Assert
      expect(navBarServiceSpy).toHaveBeenCalled();
    });

    it('should initialize the form as invalid', () => {
      // Arrange
      // Act
      // Assert
      expect(component.resetPasswordRequestForm.valid).toBeFalsy();
    });
  });
  describe('Email field validation', () => {
    it('should be invalid when empty', () => {
      //Arrange
      const emailControl = component.resetPasswordRequestForm.controls.email;
      emailControl.setValue('');
      // Act & Assert
      expect(emailControl.hasError('required')).toBeTruthy();
    });
    it('should be invalid when not a valid email', () => {
      // Arrange
      const emailControl = component.resetPasswordRequestForm.controls.email;
      emailControl.setValue('invalid-email');
      // Act & Assert
      expect(emailControl.hasError('invalidEmail')).toBeTruthy();
    });
    it('should be valid when a valid email is provided', () => {
      // Arrange
      const emailControl = component.resetPasswordRequestForm.controls.email;
      emailControl.setValue(userData.email);
      // Act & Assert
      expect(emailControl.valid).toBeTruthy();
    });
  });
  describe('onSubmit Method', () => {
    it('should call resetPasswordAsync when email is valid', () => {
      // Arrange
      const authServiceSpy = jest
        .spyOn(authService, 'resetPasswordAsync')
        .mockReturnValue(of(undefined));

      component.resetPasswordRequestForm.controls.email.setValue(
        userData.email,
      );
      // Act
      component.onSubmit();
      // Assert
      expect(authServiceSpy).toHaveBeenCalledWith(userData.email);
    });
  });
  describe('startCountdown', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      component['startCountdown']();
    });

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should initialize countdown to 60', () => {
      // Arrange
      // Act
      // Assert
      expect(component.countdown()).toBe(60);
    });

    it('should set emailSent to false initially', () => {
      // Arrange
      // Act
      // Assert
      expect(component.emailSent()).toBeFalsy();
    });
    it('should set waitCountdown to false initially', () => {
      // Arrange
      // Act
      // Assert
      expect(component.waitCountdown()).toBeFalsy();
    });
    it('should reset countdown after 60 seconds', () => {
      // Arrange
      // Act
      jest.advanceTimersByTime(60000);
      // Assert
      expect(component.countdown()).toBe(0);
    });
    it('should reset flag waitCountdown after 60 seconds', () => {
      // Arrange
      // Act
      jest.advanceTimersByTime(60000);
      // Assert
      expect(component.waitCountdown()).toBeFalsy();
    });
    it('should reset flag emailSent after 60 seconds', () => {
      // Arrange
      // Act
      jest.advanceTimersByTime(60000);
      // Assert
      expect(component.emailSent()).toBeFalsy();
    });
  });
});
