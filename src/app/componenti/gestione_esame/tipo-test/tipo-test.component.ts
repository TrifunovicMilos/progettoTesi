import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { FirebaseService } from '../../../servizi/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from '../../dialoghi/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tipo-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './tipo-test.component.html',
  styleUrl: './tipo-test.component.css'
})
export class TipoTestComponent implements OnInit{
  isLoading = true;
  esameId!: string;
  tipoTestId!: string;
  testData : any;
  uid! : string;
  nome! : string;
  cognome! : string;
  ruolo = '';

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, private firebaseService: FirebaseService, private dialog: MatDialog) {}


  ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('idEsame') || '';
    this.tipoTestId = this.route.snapshot.paramMap.get('idTipoTest') || '';

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
      this.testData = await this.firebaseService.getTestService().getTipoTestById(this.tipoTestId)
    } catch (error: any) {
      this.router.navigate(['404'])
      if(error.message == 'Test non trovato.')
        console.log(error.message)
      else
        console.log('Errore recupero test')
    }
  }

  onRemove(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Conferma eliminazione', message: 'Sei sicuro di voler eliminare il test?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      // se viene cliccato "Sì" ...
      if (result) {
        this.removeTest();
      }
    });
  }

  private async removeTest() {

    try {
      await this.firebaseService.getTestService().removeTipoTest(this.tipoTestId, this.esameId);
      console.log('Test rimosso con successo');
      this.router.navigate(['/esami', this.esameId]);
    } catch (error) {
      console.error('Errore nella rimozione del test:', error);
    }

  }

  onStart(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Avvia Test', message: 'Sei sicuro di voler svolgere il test?' }
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
      const studente = this.nome + " " + this.cognome;
      const testId = await this.firebaseService.getTestService().createTest(this.uid, studente, this.tipoTestId);
      this.router.navigate([`esami/${this.esameId}/test/${this.tipoTestId}/${testId}`]);
    } catch (error) {
      console.error("Errore nell'avvio del test:", error);
    }

  }

}
