import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FirebaseService } from '../../../servizi/firebase.service';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-domanda-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatOptionModule, MatInputModule, MatButtonModule, MatSelectModule],
  templateUrl: './create-domanda-dialog.component.html',
  styleUrl: './create-domanda-dialog.component.css'
})
export class CreateDomandaDialogComponent {
  createQuestionForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateDomandaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { esameId: string },
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    // Inizializza il form
    this.createQuestionForm = new FormGroup({
      testo: new FormControl('', [Validators.required]),
      opzioni: new FormArray([new FormControl(''), new FormControl('')], [Validators.required]),
      opzioneCorretta: new FormControl('', [Validators.required])
    });
  }

  get opzioni() {
    return (this.createQuestionForm.get('opzioni') as FormArray);
  }

  // Aggiungi una nuova opzione
  addOpzione(): void {
    this.opzioni.push(new FormControl(''));
  }

  // Funzione per aggiungere la domanda
  async addDomanda(): Promise<void> {
    if (this.createQuestionForm.valid) {
      const formData = this.createQuestionForm.value;

      // Otteniamo l'opzione corretta dal testo
      const domanda = {
        testo: formData.testo,
        opzioni: formData.opzioni,
        opzioneCorretta: formData.opzioneCorretta  // questa sarà una stringa, il testo dell'opzione
      };

      try {
        await this.firebaseService.addDomandaToEsame(this.data.esameId, domanda);
        this.dialogRef.close();
        this.router.navigate([`esami/${this.data.esameId}`]);
      } catch (error) {
        console.error('Errore nell\'aggiunta della domanda:', error);
      }
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}