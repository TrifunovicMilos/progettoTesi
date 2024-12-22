import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FirebaseService } from '../../../servizi/firebase/firebase.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-create-pool-dialog',
  standalone: true,
  imports: [MatFormFieldModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatInputModule, MatButtonModule],
  templateUrl: './create-pool-dialog.component.html',
  styleUrl: './create-pool-dialog.component.css'
})
export class CreatePoolDialogComponent {
  poolForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreatePoolDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: { esameId: string, domandeId: string[] },
    private firebaseService: FirebaseService
  ) {
    // Inizializza il form con un campo per il nome del pool
    this.poolForm = new FormGroup({
      poolName: new FormControl('') // Nome del pool
    });
  }

  async addPool(): Promise<void> {
    if (this.poolForm.valid) {
      const poolName = this.poolForm.get('poolName')?.value;
      try {
        // Chiamata al servizio per creare il pool
        await this.firebaseService.getQuestionService().createPool(poolName, this.data.esameId, this.data.domandeId);

        this.dialogRef.close();

        // Esegui l'alert dopo che il dialogo è stato chiuso
        this.dialogRef.afterClosed().subscribe(() => {
          alert("Pool '" + poolName + "' creato con successo!");
        });

      } catch (error) {
        console.error('Errore nella creazione del pool:', error);
        alert('Errore nella creazione del pool.');
      }
    } else {
      console.log('Form non valido');
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
