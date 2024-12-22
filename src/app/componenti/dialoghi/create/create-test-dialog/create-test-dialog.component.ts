import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FirebaseService } from '../../../../servizi/firebase/firebase.service';

@Component({
  selector: 'app-create-test-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatInputModule, MatButtonModule, CommonModule],
  templateUrl: './create-test-dialog.component.html',
  styleUrl: './create-test-dialog.component.css'
})
export class CreateTestDialogComponent {
  createTestForm: FormGroup;
  poolOptions: any[] = [];  
  selectedPoolQuestions: number = 0;  

  constructor(
    public dialogRef: MatDialogRef<CreateTestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { esameId: string, pools: string[] },
    private firebaseService: FirebaseService
  ) {
    this.createTestForm = new FormGroup({
      nomeTest: new FormControl('', [Validators.required]),
      descrizione: new FormControl('', [Validators.required]),
      poolId: new FormControl('', [Validators.required]),
      numeroDomande: new FormControl('', [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }

  // pool disponibili
  async ngOnInit(): Promise<void> {
    this.poolOptions = this.data.pools;
  }

  // numero di domande del pool selezionato
  async onPoolChange(poolId: string): Promise<void> {
    const pool = this.poolOptions.find(pool => pool.id === poolId);
    this.selectedPoolQuestions = pool?.domande?.length || 0;
  }

  async createTest(): Promise<void> {
    if (this.createTestForm.valid) {
      const formData = this.createTestForm.value;
      const { nomeTest, descrizione, poolId, numeroDomande } = formData;

      if (numeroDomande > this.selectedPoolQuestions) {
        alert('Il numero di domande non può essere maggiore del numero di domande nel pool.');
        return;
      }

      try {
        const testRef = await this.firebaseService.getTestService().createTipoTest(nomeTest, descrizione, poolId, numeroDomande, this.data.esameId);
        this.dialogRef.close();

        this.dialogRef.afterClosed().subscribe(() => {
          alert("Test '" + nomeTest + "' creato con successo!");
        });
      } catch (error) {
        console.error('Errore nella creazione del test: ', error);
      }
    } else {
      console.log('Form non valido');
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
