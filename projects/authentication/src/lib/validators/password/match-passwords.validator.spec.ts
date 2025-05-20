import { mockClient } from '@Common';

import { FormControl, FormGroup } from '@angular/forms';

import { matchPasswords } from './match-passwords.validator';

describe('matchPasswords', () => {
  const validatorFn = matchPasswords('password', 'confirmPassword');
  const clientData = mockClient;
  const clientInvalidData = {
    ...mockClient,
    password: 'DifferentPass!',
  };

  it('should not return errors if passwords match', () => {
    // Arrange
    const form = new FormGroup({
      password: new FormControl(clientData.password),
      confirmPassword: new FormControl(clientData.password),
    });
    const confirmPasswordControl = form.controls.confirmPassword;
    // Act
    validatorFn(form);
    // Assert
    expect(confirmPasswordControl.errors).toBeNull();
  });

  it('should set mismatch error if passwords do not match', () => {
    // Arrange
    const form = new FormGroup({
      password: new FormControl(clientData.password),
      confirmPassword: new FormControl(clientInvalidData.password),
    });
    const confirmPasswordControl = form.controls.confirmPassword;
    // Act
    validatorFn(form);
    // Assert
    expect(confirmPasswordControl.errors).toEqual({ mismatch: true });
  });

  it('should not overwrite other errors when passwords do not match', () => {
    // Arrange
    const form = new FormGroup({
      password: new FormControl(clientData.password),
      confirmPassword: new FormControl(clientInvalidData.password),
    });
    const confirmPasswordControl = form.controls.confirmPassword;
    confirmPasswordControl.setErrors({ required: true });
    // Act
    validatorFn(form);

    // Assert
    expect(confirmPasswordControl.errors).toEqual({
      required: true,
      mismatch: true,
    });
  });

  it('should remove mismatch error when passwords match again and keep other errors', () => {
    // Arrange
    const form = new FormGroup({
      password: new FormControl(clientData.password),
      confirmPassword: new FormControl(clientData.password),
    });
    const confirmPasswordControl = form.controls.confirmPassword;
    confirmPasswordControl.setErrors({ mismatch: true, required: true });
    // Act
    validatorFn(form);
    // Assert
    expect(confirmPasswordControl.errors).toEqual({ required: true });
  });

  it('should clear errors if only mismatch was present and passwords match again', () => {
    // Arrange
    const form = new FormGroup({
      password: new FormControl(clientData.password),
      confirmPassword: new FormControl(clientData.password),
    });
    const confirmPasswordControl = form.controls.confirmPassword;
    confirmPasswordControl.setErrors({ mismatch: true });
    // Act
    validatorFn(form);
    // Assert
    expect(confirmPasswordControl.errors).toBeNull();
  });

  it('should return null if either control is missing', () => {
    // Arrange
    const form = new FormGroup({
      password: new FormControl(clientData.password),
    });
    // Act
    const result = validatorFn(form);
    // Assert
    expect(result).toBeNull();
  });

  it('should return null if confirmPassword is empty', () => {
    // Arrange
    const form = new FormGroup({
      password: new FormControl(clientData.password),
      confirmPassword: new FormControl(''),
    });
    // Act
    const result = validatorFn(form);
    // Assert
    expect(result).toBeNull();
  });
});
