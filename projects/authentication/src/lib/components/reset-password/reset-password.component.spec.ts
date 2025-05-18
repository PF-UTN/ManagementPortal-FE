import { AuthService, NavBarService, mockClient } from '@Common';

import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let navBarService: NavBarService;
  let authService: DeepMockProxy<AuthService>;
  let activatedRoute: DeepMockProxy<ActivatedRoute>;
  let router: Router;

  const clientData = mockClient;
  const clientInvalidData = {
    ...mockClient,
    password: '12345',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, BrowserAnimationsModule],
      providers: [
        { provide: NavBarService, useValue: mockDeep<NavBarService>() },
        { provide: AuthService, useValue: mockDeep<AuthService>() },
        { provide: Router, useValue: mockDeep<Router>() },
        { provide: HttpClient, useValue: mockDeep<HttpClient>() },
        { provide: ActivatedRoute, useValue: mockDeep<ActivatedRoute>() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(
      AuthService,
    ) as unknown as DeepMockProxy<AuthService>;
    activatedRoute = TestBed.inject(
      ActivatedRoute,
    ) as unknown as DeepMockProxy<ActivatedRoute>;
    navBarService = TestBed.inject(NavBarService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
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
      expect(component.resetPasswordForm.valid).toBeFalsy();
    });
  });
  describe('Password field validation', () => {
    it('should set password field to invalid when empty', () => {
      // Arrange
      const passwordControl = component.resetPasswordForm.controls.password;
      // Act & Assert
      expect(passwordControl.hasError('required')).toBeTruthy();
    });
    it('should set password field to invalid when not matching regex', () => {
      // Arrange
      const passwordControl = component.resetPasswordForm.controls.password;
      passwordControl.setValue(clientInvalidData.password);
      // Act & Assert
      expect(passwordControl.hasError('pattern')).toBeTruthy();
    });
    it('should set password field to invalid when less than 8 characters', () => {
      // Arrange
      const passwordControl = component.resetPasswordForm.controls.password;
      passwordControl.setValue(clientInvalidData.password);
      // Act & Assert
      expect(passwordControl.hasError('minlength')).toBeTruthy();
    });
    it('should set password field to invalid when more than 255 characters', () => {
      // Arrange
      const passwordControl = component.resetPasswordForm.controls.password;
      passwordControl.setValue('a'.repeat(256));
      // Act & Assert
      expect(passwordControl.hasError('maxlength')).toBeTruthy();
    });
    it('should show error on confirmPassword control if passwords do not match', () => {
      // Arrange
      const passwordControl = component.resetPasswordForm.controls.password;
      const confirmPasswordControl =
        component.resetPasswordForm.controls.confirmPassword;
      passwordControl.setValue(clientData.password);
      confirmPasswordControl.setValue(clientInvalidData.password);
      // Act
      component.resetPasswordForm.updateValueAndValidity();
      // Assert
      expect(confirmPasswordControl.hasError('mismatch')).toBeTruthy();
    });
  });
  describe('onSubmit', () => {
    it('should call authService.resetPasswordAsync with token and password', () => {
      // Arrange
      const mockToken = 'mock-token';
      component.resetPasswordForm.controls.password.setValue(
        clientData.password,
      );
      activatedRoute.snapshot.paramMap.get.mockReturnValue(mockToken);
      authService.resetPasswordAsync.mockReturnValue(of(void 0));
      // Act
      component.onSubmit();
      // Assert
      expect(authService.resetPasswordAsync).toHaveBeenCalledWith(
        mockToken,
        clientData.password,
      );
    });
    it('should navigate to /login after successful reset', () => {
      // Arrange
      const mockToken = 'mock-token';
      component.resetPasswordForm.controls.password.setValue(
        clientData.password,
      );
      activatedRoute.snapshot.paramMap.get.mockReturnValue(mockToken);
      authService.resetPasswordAsync.mockReturnValue(of(void 0));
      const navigateSpy = jest.spyOn(router, 'navigate');
      // Act
      component.onSubmit();
      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
