import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../auth/auth.service';
import { MatSelectModule } from '@angular/material/select';
import { FirebaseService } from '../../servizi/firebase.service';

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

      try {
        await this.firebaseService.addEsame(
          formData.titolo, "Pinco Pallino", formData.descrizione, formData.imgUrl, 
          formData.annoAccademico, formData.crediti, formData.lingua
          );
        this.dialogRef.close();
      } catch (error) {
        console.error('Errore nell\'aggiunta dell\'esame: ', error);
      }
    } else {
      console.log('Form non valido');
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
