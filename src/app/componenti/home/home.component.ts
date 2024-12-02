import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { SidebarService } from '../../servizi/sidebar.service';
import { FirebaseService } from '../../servizi/firebase.service';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, MatIconModule, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  ruolo = '';
  isSidebarOpen = false;
  esami! : any[];
  esamiFiltered! : any[];

  constructor(private firebaseService: FirebaseService, private sidebarService: SidebarService, private dialog: MatDialog){}

  ngOnInit(): void {
    const auth = getAuth();
    
    // devo conoscere il ruolo per sapere se mostrare o meno la lista di tutti gli esami nella piattaforma
    // per ora abbiamo scelto che i docenti non la vedono perché tanto non si possono iscrivere
    onAuthStateChanged(auth, async (user) => {
      if(user)
        this.ruolo = user.email?.includes('docente') ? 'docente' : 'studente';
        if (this.ruolo === 'studente') {
          this.loadEsami();
        }
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
}