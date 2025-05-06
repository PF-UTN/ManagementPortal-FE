import { FormControl } from '@angular/forms';

import { customEmailValidator } from './email.validator';
import { mockUser } from '../../../../common/src/testing/mock-data.model';

describe('customEmailValidator', () => {
  const validator = customEmailValidator();

  it('should return null for valid email', () => {
    const control = new FormControl(mockUser.email);
    expect(validator(control)).toBeNull();
  });

  it('should return an error for invalid email', () => {
    const control = new FormControl('invalid-email');
    expect(validator(control)).toEqual({ invalidEmail: true });
  });

  it('should return error for email with single character TLD', () => {
    const control = new FormControl('test@test.c');
    expect(validator(control)).toEqual({ invalidEmail: true });
  });

  it('should trim spaces and still validate correctly', () => {
    const control = new FormControl('  valid@email.com  ');
    expect(validator(control)).toBeNull();
  });
});
