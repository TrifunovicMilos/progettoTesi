import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-registrazione',
  standalone: true,
  imports: [ MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatTabsModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './registrazione.component.html',
  styleUrl: './registrazione.component.css',
})
export class RegistrazioneComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, 
      Validators.pattern(/^[a-zA-Z]+(\.[a-zA-Z]+)@(unireply\.it|studenti\.unireply\.it)$/)]),
      
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  passwordsMatch(): boolean {
    return (
      this.registerForm.get('confirmPassword')?.value ==
      this.registerForm.get('password')?.value
    );
  }

  onRegisterSubmit() {
    if (!this.passwordsMatch()) {
      alert('Le password non corrispondono');
    } else {
      const email: string = this.registerForm.value.email;
      const password: string = this.registerForm.value.password;

      this.authService.signUp({ email: email, password: password, returnSecureToken: true }).subscribe({
        next: (data) => {
          console.log('Utente registrato con successo', data);
          this.registerForm.reset();
        },
        error: (error) => {
          // caso email già registrata
          if (error.error && error.error.error.message === 'EMAIL_EXISTS') {
            alert('Questa email è già registrata. Vai al login.')
            console.log('Email già registrata')
          } else {
            alert('Si è verificato un errore. Riprova più tardi.')
            console.log('Errore')
          }
        }
      });
    }
  }
}
