import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InfoDialogComponent } from '../dialoghi/info-dialog/info-dialog.component';
import { SidebarService } from '../../servizi/sidebar.service';
import { FirebaseService } from '../../servizi/firebase/firebase.service';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateExamDialogComponent } from '../dialoghi/create/create-exam-dialog/create-exam-dialog.component';
import { AuthService } from '../../auth/auth.service';
import { ConfirmDialogComponent } from '../dialoghi/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, MatIconModule, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  
  isLoading = true;
  nome = '';
  cognome = '';
  ruolo = '';
  uid = '';
  numeroEsami = 0;
  isSidebarOpen = false;
  esami! : any[]; // tutti gli esami esistenti
  esamiFiltered! : any[]; // risultato della ricerca
  esamiIscrittiID! : any[]; // id degli esami a cui uno studente si è iscritto, 
  // in modo tale che, al clic su un esame, so se farlo entrare nella pagina relatica oppure chiedergli prima di iscriversi

  constructor(private authService: AuthService, private firebaseService: FirebaseService, 
    private sidebarService: SidebarService, private dialog: MatDialog, private router: Router){}

  ngOnInit(): void {
    this.authService.getUserObservable().subscribe(userData => {
      if (userData) {
        this.nome = userData.nome || '';
        this.cognome = userData.cognome || '';
        this.ruolo = this.authService.getUserRole();
        this.numeroEsami = userData.esami?.length || 0; // per mostrare al docente quanti esami gestisce
        this.uid = this.authService.getUid() || '';
        if (this.ruolo === 'studente') {
          this.loadEsami(); // lo studente deve visualizzare tutti gli esami
          this.esamiIscrittiID = userData.esami;
        }
      }
      this.isLoading = false;
    });

    this.sidebarService.sidebarState$.subscribe(state => {
      this.isSidebarOpen = state; 
    });
  }
  
  // recupero degli esami da firestore
  async loadEsami() {
    try {
      this.esami = await this.firebaseService.getExamService().getEsami() || [];
      this.esamiFiltered = [...this.esami];
    } catch (error) {
      console.log('Errore nel recupero degli esami');
    } 
  }

  onInput(filter: string) {
    this.esamiFiltered = this.esami.filter(esame => 
      esame.titolo.toLowerCase().includes(filter.toLowerCase()) || 
      esame.docente.toLowerCase().includes(filter.toLowerCase())
    );
  }
  

  // mostra la descrizione dell'esame al click su "info"
  onClickInfo(esame: any): void {
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      data: { title: 'Descrizione Corso', message: esame.descrizione }
    });
  }

  openCreateExamDialog(): void {
    const dialogRef = this.dialog.open(CreateExamDialogComponent, {
      width: '37%',
      // panelClass: 'custom-dialog'
      data: { docenteUid: this.uid, docente: `${this.nome} ${this.cognome}` }
    });
  }

  isSubscribed(esame: any): boolean{
    return this.esamiIscrittiID.includes(esame.id);
  }

  onSubscribe(esame: any){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: "Iscrizione all'esame", message: `Vuoi iscriverti a ${esame.titolo}?` }
    });

    dialogRef.afterClosed().subscribe(async result => {
      // se viene cliccato "Sì" ...
      if (result) {
        try{
          await this.firebaseService.getExamService().addEsameToUser(this.uid, 'studente', esame.id);
          await this.authService.loadUserData(this.uid);
        } catch (error) {
          console.error('Errore nell\'aggiunta dell\'esame: ', error);
        }
        finally{
          this.router.navigate([`esami/${esame.id}`]);
        }
      }
    });
  }

}