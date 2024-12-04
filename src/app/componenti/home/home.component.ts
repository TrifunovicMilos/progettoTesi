import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { SidebarService } from '../../servizi/sidebar.service';
import { FirebaseService } from '../../servizi/firebase.service';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateExamDialogComponent } from '../create-exam-dialog/create-exam-dialog.component';
import { UserService } from '../../servizi/user.service';

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
  numeroEsami = 0;
  isSidebarOpen = false;
  esami! : any[];
  esamiFiltered! : any[];

  constructor(private userService: UserService, private firebaseService: FirebaseService, private sidebarService: SidebarService, private dialog: MatDialog){}

  ngOnInit(): void {
    this.userService.getUserObservable().subscribe(userData => {
      this.nome = userData.nome;
      this.cognome = userData.cognome;
      this.ruolo = this.userService.getUserRole();
      this.numeroEsami = userData.esami.length;
      if (this.ruolo === 'studente') {
        this.loadEsami();
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
      this.esami = await this.firebaseService.getEsami() || [];
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
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Il dialog è stato chiuso');
    });
  }

}