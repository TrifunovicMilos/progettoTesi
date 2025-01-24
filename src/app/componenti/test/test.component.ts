import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../servizi/firebase/firebase.service';
import { AuthService } from '../../auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from '../dialoghi/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatRadioModule, FormsModule, MatCardModule, RouterLink],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit{
  isLoading = true;
  isCompleted = false;
  isNavOpen = false;
  uid! : string;
  nome! : string;
  cognome! : string;
  ruolo! : string;
  testData : any;
  nomeTest : any;
  descrizione : any;
  esameId!: string;
  testId! : string;
  domande: any[] = [];
  risposte: { [key: string]: string } = {};
  risposteCorrette = 0;
  voto = 0;
  currentQuestionIndex: number = 0;

  // Riferimento per tutte le domande
  @ViewChildren('domandaRef') domandaRefs!: QueryList<ElementRef>;

  constructor(private route: ActivatedRoute, private router: Router, private firebaseService: FirebaseService, private authService: AuthService, private dialog: MatDialog) {}

  async ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('idEsame') || "";
    this.testId = this.route.snapshot.paramMap.get('idTest') || "";

    this.authService.getUserObservable().subscribe(userData => {
      if (userData) {
        this.uid = this.authService.getUid() || '';
        this.nome = userData.nome || '';
        this.cognome = userData.cognome || '';
        this.ruolo = this.authService.getUserRole();
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

      // caso in cui entro in un test già svolto: effettuo e mostro la revisione
      if (this.testData.voto != null && this.testData.risposte) {
        // test completato: con "true" nego la possibilità di cambiare le risposte e inviare test (vedi html)
        this.isCompleted = true;
        this.voto = this.testData.voto;
        const risposte = this.testData.risposte

        // calcolo il numero di risposte corrette perché tale numero non è salvato nel database, solo il voto
        let corrette = 0;
        this.domande.forEach((domanda, index) => {
          if (risposte[index]) {
            this.risposte[domanda.id] = risposte[index];
            if (this.risposte[domanda.id] === domanda.opzioneCorretta) {
              corrette++;
            } 
          }
        });
        this.risposteCorrette = corrette;
      }

      if (this.ruolo == "docente" && !this.isCompleted ) {
        this.router.navigate(['/404']);
      }

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

  onSubmit(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Invio test', 
      message: "Sei sicuro di voler inviare il test?. Una volta inviato, le risposte date non potranno più essere modificate." }
    });

    dialogRef.afterClosed().subscribe(result => {
      // se viene cliccato "Sì" ...
      if (result) {
        this.inviaTest();
      }
    });
  }

  private async inviaTest() {
    let corrette = 0;
    const risposte: any[] = [];

    // Correzione
    this.domande.forEach(domanda => {
      if (this.risposte[domanda.id] === domanda.opzioneCorretta) {
        corrette++;
      }
      risposte.push(this.risposte[domanda.id]);
    });

    this.voto = Math.round(100 * (corrette / this.domande.length) * 100) / 100;

    // data e ora corrente
    const data = new Date();

    // Salva il risultato nel database
    const studente = this.nome + " " +this.cognome
    await this.firebaseService.getTestService().saveTest(this.uid, this.testId, risposte, this.voto, data.toUTCString(), studente);
    await this.authService.loadUserData(this.uid);

    // Visualizza il risultato
    this.risposteCorrette = corrette;
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
      const testId = await this.firebaseService.getTestService().createTest(this.testData.tipoTest);
      this.authService.loadUserData(this.uid).then(() => {
        this.router.navigate([`esami/${this.esameId}/test/${this.testData.tipoTest}/${testId}`]).then(() => {
          window.location.reload();
        });
      });
    } catch (error) {
      console.error("Errore nell'avvio del test:", error);
    }

  }

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.domande.length - 1) {
      this.currentQuestionIndex++;
    }
  }
  
  goToQuestion(index: number) {
    this.currentQuestionIndex = index;
  }

  scrollToQuestion(index: number): void {
    this.currentQuestionIndex = index;
    // Ottieni il riferimento dell'elemento domanda selezionato
    const domandaRef = this.domandaRefs.toArray()[index];
    if (domandaRef) {
      // Esegui lo scroll fino alla domanda
      domandaRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent): void {
    event.preventDefault(); 
    
    if (!this.isComplete()) {
      // Se il test non è completo
      if (this.currentQuestionIndex < this.domande.length - 1) {
        // Passa alla prossima domanda, se non sei sull'ultima
        this.nextQuestion();
      }
    } else {
      // Se il test è completo
      if (this.currentQuestionIndex === this.domande.length - 1) {
        // Esegui invio se sei sull'ultima domanda
        this.onSubmit();
      }
      else {
        this.nextQuestion();
      }
    }
  }

}
