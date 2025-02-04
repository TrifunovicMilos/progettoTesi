import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InfoDialogComponent } from '../dialoghi/info-dialog/info-dialog.component';
import { SidebarService } from '../../servizi/sidebar.service';
import { FirebaseService } from '../../servizi/firebase/firebase.service';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../auth/auth.service';
import { CreateExamDialogComponent } from '../dialoghi/create/create-exam-dialog/create-exam-dialog.component';

@Component({
  selector: 'app-i-miei-esami',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, MatIconModule, CommonModule, RouterLink],
  templateUrl: './i-miei-esami.component.html',
  styleUrl: './i-miei-esami.component.css'
})
export class IMieiEsamiComponent implements OnInit{
  
  isLoading = true;
  nome = '';
  cognome = '';
  ruolo = '';
  uid = '';
  isSidebarOpen = false;
  esami! : any[]; // tutti gli esami che gestisce il docente o ai quali lo studente è iscritto
  esamiFiltered! : any[]; // lo studente cerca per nome o docente, docente cerca solo per nome 

  constructor(private authService: AuthService, private firebaseService: FirebaseService, private sidebarService: SidebarService, private dialog: MatDialog){}

  ngOnInit(): void {
    this.authService.getUserObservable().subscribe(userData => {
      if (userData) {
        this.nome = userData.nome || '';
        this.cognome = userData.cognome || '';
        this.ruolo = this.authService.getUserRole();
        this.uid = this.authService.getUid() || '';
        this.loadEsami().then(() => {
          this.isLoading = false;
        });
      }
    });

      this.sidebarService.sidebarState$.subscribe(state => {
        this.isSidebarOpen = state; 
      });
  }

  async loadEsami() {
    this.esami = await this.firebaseService.getExamService().getUserEsami(this.uid, this.ruolo);
    this.esamiFiltered = [...this.esami];
  }

  // lo studente cerca gli esami per nome o docente
  onInput(filter: string) {
    this.esamiFiltered = this.esami.filter(esame => 
      esame.titolo.toLowerCase().includes(filter.toLowerCase()) || 
      esame.docente.toLowerCase().includes(filter.toLowerCase())
    );
  }

  // il docente cerca gli esami per nome
  onInputNome(filter: string) {
    this.esamiFiltered = this.esami.filter(esame => 
      esame.titolo.toLowerCase().includes(filter.toLowerCase())
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
      width: '380px',
      // panelClass: 'custom-dialog'
      data: { docenteUid: this.uid, docente: `${this.nome} ${this.cognome}` }
    });

    dialogRef.afterClosed().subscribe((result) => {
      // console.log('Il dialog è stato chiuso');
    });
  }

}
