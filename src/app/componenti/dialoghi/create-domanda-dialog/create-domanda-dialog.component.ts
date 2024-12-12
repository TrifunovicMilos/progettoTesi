import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FirebaseService } from '../../../servizi/firebase/firebase.service';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-create-domanda-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatOptionModule, MatInputModule, MatButtonModule, MatSelectModule],
  templateUrl: './create-domanda-dialog.component.html',
  styleUrl: './create-domanda-dialog.component.css',
})
export class CreateDomandaDialogComponent {
  createQuestionForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateDomandaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { esameId: string },
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.createQuestionForm = new FormGroup({
      testoDomanda: new FormControl('', [Validators.required]),
      opzioni: new FormArray([ new FormControl('', [Validators.required]), new FormControl('', [Validators.required]),]),
      opzioneCorretta: new FormControl('', [Validators.required]),
    });
  }

  get opzioni(): FormArray {
    return this.createQuestionForm.get('opzioni') as FormArray;
  }

  getOpzioni(): string[] {
    return this.opzioni.controls.map((control) => control.value);
  }

  aggiungiOpzione(): void {
    this.opzioni.push(new FormControl('', [Validators.required]));
  }

  async addDomanda(): Promise<void> {
    if (this.createQuestionForm.valid) {
      const formData = this.createQuestionForm.value;

      const testo = formData.testoDomanda;
      const opzioni = formData.opzioni;
      const opzioneCorretta = formData.opzioneCorretta; 

      let domandaRef: any;

      try{
        domandaRef = await this.firebaseService.getQuestionService().addDomanda(testo, opzioni, opzioneCorretta);

        await this.firebaseService.getQuestionService().addDomandaToEsame(domandaRef.id, this.data.esameId)

        // TODO: aggiorna dati istant

        this.dialogRef.close();
      } catch (error) {
        console.error('Errore nell\'aggiunta della domanda: ', error);
      }
    } else {
      console.log('Form non valido');
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
