import { FormControl } from '@angular/forms';

import { customEmailValidator } from './email.validator';
import { mockUser } from '../models/mock-data.model';

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
});
