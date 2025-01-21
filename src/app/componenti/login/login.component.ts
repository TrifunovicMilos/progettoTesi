import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordDialogComponent } from '../dialoghi/forgot-password-dialog/forgot-password-dialog.component';
import { passwordValidator } from '../../validators/password.validator';
import { confirmPasswordValidator } from '../../validators/confirmPassword.validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule, MatTabsModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})

export class LoginComponent implements OnInit {
  registerForm!: FormGroup;
  loginForm!: FormGroup;
  // salvo in una variabile la email con la quale ho provato ad accedere,
  // in modo tale da usarla come predefinita al click di "Password Dimenticata"
  emailLogin = '';
  // tipologia errore password di registrazione
  registerPasswordError = 0; // mancante (1), corta (2), debole (3)
  confirmPasswordError = 0;  // mancante (1), diversa da password (2)
  passwordsMatch = true;
  hideLoginPassword = true;
  hideRegistrationPassword = true;

  constructor(private authService: AuthService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });

    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, 
        Validators.pattern(/^[a-z]+(\.[a-z]+)+\.(studente|docente)@yopmail\.com$/)]),

      // La password deve contenere almeno 8 caratteri, una lettera maiuscola, una lettera minuscola e un numero.
      password: new FormControl('', [Validators.required, Validators.minLength(8), passwordValidator()]),
      confirmPassword: new FormControl(''),
    });
    
    // check dinamico sulla password
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.checkPasswordErrors();
      this.comparePasswords();
    });
    
    // aggiungo solo ora il validatore, in quanto sopra 'password' non era ancora nota
    this.registerForm.get('confirmPassword')?.setValidators([
      Validators.required, confirmPasswordValidator(this.registerForm.get('password')!),
    ]);
    
    // check dinamico sulla conferma password
    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkConfirmPasswordsErrors();
      this.comparePasswords();
    });
  }

  toggleLoginPassword(): void {
    this.hideLoginPassword = !this.hideLoginPassword;
  }

  toggleRegistrationPassword(): void {
    this.hideRegistrationPassword = !this.hideRegistrationPassword;
  }

  private checkPasswordErrors(): void {
    const password = this.registerForm.get('password')

    if (password?.hasError('required'))
      this.registerPasswordError = 1; // password non inserita
    else if (password?.hasError('minlength'))
      this.registerPasswordError = 2; // password corta
    else if (password?.hasError('passwordStrength'))
      this.registerPasswordError = 3; // password debole
    else {
      this.registerPasswordError = 0;
    }
  }

  private checkConfirmPasswordsErrors(): void {
    const confirmPassword = this.registerForm.get('confirmPassword');

    if (confirmPassword?.hasError('required'))
      this.confirmPasswordError = 1; // password non inserita
    else if (confirmPassword?.hasError('passwordMismatch'))
      this.confirmPasswordError = 2; // password diversa
    else {
      this.confirmPasswordError = 0;
    }
  }
  
  // aggiorna passwordMatch ogni volta che password o confirmPassword subiscono modifiche
  private comparePasswords(): void {
    this.passwordsMatch =
      this.registerForm.get('confirmPassword')?.value ==
      this.registerForm.get('password')?.value;
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value; // estraggo i valori dal form
      // salvo l'email nel caso l'accesso non vada a buon fine, per passarla come predefinita al dialog di Password Dimenticata
      this.emailLogin = email;

      this.authService.login(email, password)
        .catch((error: any) => {
          if (error.message === 'Email non verificata.') {
            alert(error.message + ' Controlla la tua posta.');
          } else {
            alert('Errore durante il login. Controlla le credenziali.');
          }
        });
    }
  }
  
  // si attiva al click di "Password Dimenticata?"
  // passo l'ultima email con la quale ho provato (erroneamente) ad accedere
  openForgotPasswordDialog(): void {
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      width: '400px',
      data: { email: this.emailLogin }, // Passo l'email al dialog
    });

    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  onRegisterSubmit(): void {
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;

    this.authService.signUp(email, password)
      .then(() => {
        alert('Registrazione completata! Controlla la tua email per verificare l’account.');
        console.log('Utente registrato con successo');
        // una volta registrati si va su /signin.
        // usando router.navigate(['/signin']) al posto del reload non funziona perché ci fa rimanere sulla tab 'Registrazione'
        window.location.reload();
      })
      .catch((error: any) => {
        if (error.code === 'auth/email-already-in-use') {
          alert('Questa email è già registrata. Per favore, prova a fare il login.');
        } else {
          console.error(error);
          alert('Si è verificato un errore durante la registrazione.');
        }
      });
  }
}
