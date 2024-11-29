import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { SidebarService } from '../../servizi/sidebar.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  ruolo = '';
  isSidebarOpen = false;

  constructor(private sidebarService: SidebarService, private dialog: MatDialog){}

  ngOnInit(): void {
    const auth = getAuth();
    
    // devo conoscere il ruolo per sapere se mostrare o meno la lista di tutti gli esami nella piattaforma
    // per ora abbiamo scelto che i docenti non la vedono perché tanto non si possono iscrivere
    onAuthStateChanged(auth, async (user) => {
      if(user)
        this.ruolo = user.email?.includes('docente') ? 'docente' : 'studente';
      });

      this.sidebarService.sidebarState$.subscribe(state => {
        this.isSidebarOpen = state; 
      })

    }

  // per ora esami con titolo e descrizioni uguali
  onClickInfo(): void {
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      data: { title: 'Descrizione Corso', message: 'Questo corso fornisce le basi del calcolo differenziale e integrale per funzioni reali di una variabile. Si studiano limiti, derivate, integrali e le loro applicazioni, con particolare attenzione alla comprensione teorica e alla risoluzione di problemi pratici.' }
    });
  }
}