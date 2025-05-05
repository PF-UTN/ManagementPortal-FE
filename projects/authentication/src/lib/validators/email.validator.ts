import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function customEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = EMAIL_REGEX.test(control.value);
    return isValid ? null : { invalidEmail: true };
  };
}
