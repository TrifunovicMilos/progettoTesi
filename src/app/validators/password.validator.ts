import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    const hasUpperCase = /[A-Z]/.test(value);

    const hasLowerCase = /[a-z]/.test(value);

    const hasNumber = /\d/.test(value);

    const isValidLength = value.length >= 8;

    if (hasUpperCase && hasLowerCase && hasNumber && isValidLength) {
      return null; // password valida
    }

    // Restituisce l'errore se non soddisfa i criteri
    return { 'passwordStrength': true };
  };
}
