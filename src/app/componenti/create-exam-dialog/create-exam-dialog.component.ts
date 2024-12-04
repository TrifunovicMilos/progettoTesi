import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FirebaseService } from '../../servizi/firebase.service';
import { UserService } from '../../servizi/user.service';

@Component({
  selector: 'app-create-exam-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatInputModule, MatButtonModule, CommonModule],
  templateUrl: './create-exam-dialog.component.html',
  styleUrl: './create-exam-dialog.component.css'
})
export class CreateExamDialogComponent {
  createExamForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateExamDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private firebaseService: FirebaseService
  ) {
    this.createExamForm = new FormGroup({
      titolo: new FormControl('', [Validators.required]),
      descrizione: new FormControl('', [Validators.required]),
      crediti: new FormControl('', [Validators.required, Validators.min(1)]),
      annoAccademico: new FormControl('', [
        Validators.required, 
        Validators.pattern(/^\d{4}-\d{4}$/) // Formato YYYY-YYYY
      ]),
      lingua: new FormControl('', [Validators.required]),
      imgUrl: new FormControl('', [
        Validators.required, 
        Validators.pattern(/https?:\/\/.+/), // Verifica che sia un URL valido
      ]),
    });
  }

  async createExam(): Promise<void> {
    if (this.createExamForm.valid) {
      const formData = this.createExamForm.value;
      const user = this.userService.getUser();
      const ruolo = this.userService.getUserRole()
  
      if (user && ruolo == 'docente') {
        try {
          const docente = `${user.nome} ${user.cognome}`;
          const esameRef = await this.firebaseService.addEsame(
            formData.titolo, docente, formData.descrizione, formData.imgUrl, 
            formData.annoAccademico, formData.crediti, formData.lingua
          );
  
          await this.firebaseService.addEsameToUser(user.uid, ruolo, esameRef.id);
  
          this.dialogRef.close();
        } catch (error) {
          console.error('Errore nell\'aggiunta dell\'esame: ', error);
        }
      } else {
        console.log('Utente non autorizzato o non autenticato');
      }
    } else {
      console.log('Form non valido');
    }
  }
  
  onClose(): void {
    this.dialogRef.close();
  }

}
