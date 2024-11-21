import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-forgot-password-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule, MatButtonModule, CommonModule],
  templateUrl: './forgot-password-dialog.component.html',
  styleUrl: './forgot-password-dialog.component.css'
})
export class ForgotPasswordDialogComponent {

  forgotPasswordForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private authService: AuthService
  ) {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl(this.data.email || '', 
      [Validators.required, Validators.pattern(/^[a-z]+(\.[a-z]+)+\.(studente|docente)@yopmail\.com$/)]) 
    });
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      console.log('Recupero password per:', email);
      
      this.authService.resetPassword(email).then(() => {
        alert('Email per il reset della password inviata')
        console.log('Email per il reset della password inviata');
        this.dialogRef.close(); // Chiudi il dialog dopo aver inviato l'email
      }).catch((error) => {
        console.error('Errore durante il reset della password:', error);
      });
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
