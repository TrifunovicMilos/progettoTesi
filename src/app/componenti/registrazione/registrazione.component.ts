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
      Validators.pattern(/^[a-zA-Z]+(\.[a-zA-Z]+)@(unipd\.it|studenti\.unipd\.it)$/)]),
      
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

      this.authService.signUp({ email, password}).then(()=> {
          alert('Registrazione completata! Controlla la tua email per verificare l’account.');
          console.log('Utente registrato con successo');
          this.registerForm.reset();
        })
        .catch((error: any) => {
          alert("Questa email è già registrata. Per favore, prova a fare il login.");
      });
    }
  }
}
