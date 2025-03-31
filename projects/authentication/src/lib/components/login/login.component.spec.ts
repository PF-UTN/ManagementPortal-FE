import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { FormControl } from '@angular/forms';
import { throwError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { mockUser, mockInvalidUser } from '../../models/mock-data.model';



describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach( () => {
     TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,    
        LoginComponent,         
      ],
      providers: [
        provideHttpClient(),    
        provideRouter([]),      
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  describe('Form Validation', () => {

    it('should initialize form as invalid', () => {
      // Arrange: No actions needed here, form is initialized
      // Act: Check if the form is invalid on initialization
      // Assert: Form should be invalid initially
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should validate email field', () => {
      const emailControl = component.loginForm.get('email') as FormControl;

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
      const passwordControl = component.loginForm.get('password') as FormControl;

      // Arrange: Set password to empty
      passwordControl.setValue('');
      // Act & Assert: Check required validation
      expect(passwordControl.hasError('required')).toBeTruthy();

      // Arrange: Set password to a short value
      passwordControl.setValue('12345');
      // Act & Assert: Check minimum length validation
      expect(passwordControl.hasError('minlength')).toBeTruthy();

      // Arrange: Set password to a valid value
      passwordControl.setValue('password123');
      // Act & Assert: No validation errors should appear
      expect(passwordControl.hasError('minlength')).toBeFalsy();
      expect(passwordControl.hasError('required')).toBeFalsy();
    });

  });

  describe('onSubmit Method', () => {

    it('should login successfully with valid credentials', () => {
      // Arrange: Prepare valid credentials
      const credentials = mockUser;
      const authServiceSpy = jest.spyOn(component['authService'], 'logInAndSaveToken').mockReturnValue(of({ token: 'mockToken' }));
      component.loginForm.setValue(credentials);

      // Act: Call onSubmit with valid credentials
      component.onSubmit();

      // Assert: Expect router navigate to be called
      expect(authServiceSpy).toHaveBeenCalledWith(credentials);
      expect(component.errorMessage).toBe('');
    });

    it('should show error message for invalid login', () => {
      // Arrange: Prepare invalid credentials
      const credentials = mockInvalidUser;
      
      // Simulamos el error con el status 401
      const authServiceSpy = jest.spyOn(component['authService'], 'logInAndSaveToken').mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }))
      );
      
      component.loginForm.setValue(credentials);
    
      // Act: Call onSubmit with invalid credentials
      component.onSubmit();
    
      // Assert: Error message should be displayed
      expect(component.errorMessage).toBe('El email o contraseña ingresados son incorrectos');
    });
    
    it('should handle unexpected errors gracefully', () => {
      // Arrange: Prepare invalid credentials
      const credentials = mockInvalidUser;
      
      // Simulamos el error con un status 500 (error del servidor)
      const authServiceSpy = jest.spyOn(component['authService'], 'logInAndSaveToken').mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }))
      );
      
      component.loginForm.setValue(credentials);
    
      // Act: Call onSubmit
      component.onSubmit();
    
      // Assert: A generic error message should be displayed
      expect(component.errorMessage).toBe('Ocurrió un error. Inténtalo de nuevo más tarde.');
    });

  describe('togglePasswordVisibility Method', () => {

    it('should toggle password visibility', () => {
      // Arrange: Initial hidePassword is true
      expect(component.hidePassword).toBe(true);

      // Act: Toggle password visibility
      component.togglePasswordVisibility();

      // Assert: Password visibility should now be false
      expect(component.hidePassword).toBe(false);

      // Act: Toggle password visibility again
      component.togglePasswordVisibility();

      // Assert: Password visibility should revert to true
      expect(component.hidePassword).toBe(true);
    });

  });

  describe('navigateToRegister Method', () => {

    it('should navigate to register page', () => {
      // Arrange: Spy on router navigate
      const routerSpy = jest.spyOn(component['router'], 'navigate');

      // Act: Call navigateToRegister
      component.navigateToRegister();

      // Assert: Router should navigate to '/signup'
      expect(routerSpy).toHaveBeenCalledWith(['/signup']);
    });

  });

});
});
