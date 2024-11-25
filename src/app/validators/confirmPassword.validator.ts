import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function confirmPasswordValidator(passwordControl: AbstractControl): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = passwordControl.value;
    const confirmPassword = control.value;

    // Verifica se la password e la conferma della password sono uguali
    if (password !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    return null; // Se le password coincidono
  };
}
