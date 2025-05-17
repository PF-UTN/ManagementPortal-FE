import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';

export function matchPasswords(
  passwordKey: string,
  confirmPasswordKey: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;

    const password = formGroup.get(passwordKey);
    const confirmPassword = formGroup.get(confirmPasswordKey);

    if (!password || !confirmPassword) return null;
    if (!confirmPassword.value) return null;

    const errors = confirmPassword.errors || {};

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...errors, mismatch: true });
    } else {
      if ('mismatch' in errors) {
        delete errors['mismatch'];
        const hasOtherErrors = Object.keys(errors).length > 0;
        confirmPassword.setErrors(hasOtherErrors ? errors : null);
      }
    }

    return null;
  };
}
