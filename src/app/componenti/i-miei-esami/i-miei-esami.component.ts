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
import { UserService } from '../../servizi/user.service';

@Component({
  selector: 'app-i-miei-esami',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, MatIconModule, CommonModule, RouterLink],
  templateUrl: './i-miei-esami.component.html',
  styleUrl: './i-miei-esami.component.css'
})
export class IMieiEsamiComponent implements OnInit{
  
  isLoading = true;
  ruolo = '';
  isSidebarOpen = false;
  esamiID! : []; // i docenti e studenti nel loro array di esami contengono gli ID degli esami
  esami! : any[]; // tutti gli esami che gestisce il docente o ai quali lo studente è iscritto
  esamiFiltered! : any[]; // lo studente cerca per nome o docente, docente solo per nome 

  constructor(private userService: UserService, private firebaseService: FirebaseService, private sidebarService: SidebarService, private dialog: MatDialog){}

  ngOnInit(): void {
    this.userService.getUserObservable().subscribe(userData => {
      if (userData) {
        this.ruolo = this.userService.getUserRole();
        this.esamiID = userData.esami || [];
        this.loadEsami();
      }
      this.isLoading = false;
    });

      this.sidebarService.sidebarState$.subscribe(state => {
        this.isSidebarOpen = state; 
      });
  }

  async loadEsami() {
    const esamiPromises = this.esamiID.map(async (esameId: string) => {
      return await this.firebaseService.getEsameById(esameId);
    });

    this.esami = await Promise.all(esamiPromises);
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

}
