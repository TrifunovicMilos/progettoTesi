import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// vincoli password: carattere maiusolo, minuscolo, numero. 
// (la lunghezza minima (8) è gestita da un altro validatore (minLength), per differenziare i messaggi di errore)
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    const hasUpperCase = /[A-Z]/.test(value);

    const hasLowerCase = /[a-z]/.test(value);

    const hasNumber = /\d/.test(value);


    if (hasUpperCase && hasLowerCase && hasNumber) {
      return null; // password valida
    }

    // Restituisce l'errore se non soddisfa i criteri
    return { 'passwordStrength': true };
  };
}
