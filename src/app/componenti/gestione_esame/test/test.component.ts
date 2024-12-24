import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../../servizi/firebase/firebase.service';
import { AuthService } from '../../../auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from '../../dialoghi/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatRadioModule, FormsModule, MatCardModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit{
  isLoading = true;
  isCompleted = false;
  uid! : string;
  testData : any;
  nomeTest : any;
  descrizione : any;
  esameId!: string;
  testId! : string;
  domande: any[] = [];
  risposte: { [key: string]: string } = {};
  risultato: { corrette: number } | null = null;
  voto = 0;

  constructor(private route: ActivatedRoute, private router: Router, private firebaseService: FirebaseService, private authService: AuthService, private dialog: MatDialog) {}

  async ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('idEsame') || "";
    this.testId = this.route.snapshot.paramMap.get('idTest') || "";

    this.authService.getUserObservable().subscribe(userData => {
      if (userData) {
        this.uid = this.authService.getUid() || '';
        const ruolo = this.authService.getUserRole();
        const esamiUtente = userData.esami || '';
        // se non sono uno studente di questo esame visualizzo un errore
        if (!(esamiUtente.includes(this.esameId) && ruolo === 'studente'))
          this.router.navigate(['exam-denied'])
        else
          this.loadTestDetails().then(() => {
            this.isLoading = false;
          });
      }
    });
  }

  async loadTestDetails() {
    try {
      this.testData = await this.firebaseService.getTestService().getTestById(this.testId)
      const domandeId = this.testData.domande;
      await this.loadDomande(domandeId)
      const tipoTestData = await this.firebaseService.getTestService().getTipoTestById(this.testData.tipoTest);
      this.nomeTest = tipoTestData.nomeTest;
      this.descrizione = tipoTestData.descrizione;
    } catch (error: any) {
      this.router.navigate(['404'])
      if(error.message == 'Test non trovato.')
        console.log(error.message)
      else
        console.log('Errore recupero test')
    }
  }

  async loadDomande(domandeID: string[]) {
    const domandePromises = domandeID.map(async (domandaId: string) => {
      
      const domanda = await this.firebaseService.getQuestionService().getDomandaById(domandaId);
      domanda.selected = false; 
      return domanda;
    });

    this.domande = await Promise.all(domandePromises);
  }
  
  isComplete(): boolean {
    return this.domande.every(domanda => this.risposte[domanda.id]);
  }

  async inviaTest() {
    let corrette = 0;

    // Correzione
    this.domande.forEach(domanda => {
      if (this.risposte[domanda.id] === domanda.opzioneCorretta) {
        corrette++;
      }
    });

    this.voto = 100*(corrette/this.domande.length);

    // Salva il risultato nel database
    await this.firebaseService.getTestService().saveTest(this.testId, this.voto);

    // Visualizza il risultato
    this.risultato = { corrette };
    this.isCompleted = true;
  }

  onRetry(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Nuovo tentativo', 
      message: "Sei sicuro di voler ripetere il test? Il punteggio finale sarà quello ottenuto nell’ultimo tentativo" }
    });

    dialogRef.afterClosed().subscribe(result => {
      // se viene cliccato "Sì" ...
      if (result) {
        this.startTest();
      }
    });
  }

  private async startTest() {

    try {
      const testId = await this.firebaseService.getTestService().createTest(this.uid, this.testData.tipoTest);
      this.router.navigate([`esami/${this.esameId}/test/${this.testData.tipoTest}/${testId}`]).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Errore nell'avvio del test:", error);
    }

  }

}
