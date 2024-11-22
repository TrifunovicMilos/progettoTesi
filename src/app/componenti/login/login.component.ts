import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';
import { passwordValidator } from '../../validators/password.validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatTabsModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  registerForm!: FormGroup;
  loginForm!: FormGroup;
  // salvo in una variabile la email con la quale ho provato ad accedere, 
  // in modo tale da usarla come predefinita al click di "Password Dimenticata"
  emailLogin = ''; 

  constructor(private authService: AuthService, private dialog: MatDialog) {}

  ngOnInit(): void {
    
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, 
      Validators.pattern(/^[a-z]+(\.[a-z]+)+\.(studente|docente)@yopmail\.com$/)]),
      
      // La password deve contenere almeno 8 caratteri, una lettera maiuscola, una lettera minuscola e un numero.
      password: new FormControl('', [Validators.required, Validators.minLength(8),
      passwordValidator()]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value; // estraggo i valori dal form
      this.emailLogin = email;

      this.authService.login(email, password).then(() => {
        console.log('Login eseguito');
      }).catch((error: any) => {
        if(error.message === 'Email non verificata. '){
          console.log('Email non verificata');
          alert(error.message + 'Controlla la tua posta.')
        }
        else{
          console.log('Errore durante il login');
          alert("Errore durante il login. Controlla le credenziali.");
        }
      });
    }
  }

  openForgotPasswordDialog(): void {
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      width: '400px',
      data: { email: this.emailLogin } // Passo l'email al dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Il dialog è stato chiuso');
    });
  }

  // chiamata da onRegisterSubmit()
  private passwordsMatch(): boolean {
    return (
      this.registerForm.get('confirmPassword')?.value ==
      this.registerForm.get('password')?.value
    );
  }

  onRegisterSubmit(): void {
    if (!this.passwordsMatch()) {
      alert('Le password non corrispondono');
    } else {
      const email = this.registerForm.value.email;
      const password = this.registerForm.value.password;

      this.authService.signUp(email, password).then(()=> {
          alert('Registrazione completata! Controlla la tua email per verificare l’account.');
          console.log('Utente registrato con successo');
          // una volta registrati si va su /signin. 
          //Usando router.navigate(['/signin']) al posto del reload non funziona perché ci fa rimanere sulla tab 'Registrazione'
          window.location.reload();
        })
        .catch((error: any) => {
          if (error.code === 'auth/email-already-in-use') {
            console.log('Email già registrata')
            alert("Questa email è già registrata. Per favore, prova a fare il login.");
          } else {
            console.error(error);
            alert('Si è verificato un errore durante la registrazione.');
          }
      });
    }
  }
}
