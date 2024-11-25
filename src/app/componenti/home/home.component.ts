import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor(private dialog: MatDialog){}

  ruolo = '';

  ngOnInit(): void {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if(user)
        this.ruolo = user.email?.includes('docente') ? 'docente' : 'studente';
      });
    }

  // per ora esami con titolo e descrizioni uguali
  onClickInfo(): void {
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      data: { title: 'Descrizione Corso', message: 'Questo corso fornisce le basi del calcolo differenziale e integrale per funzioni reali di una variabile. Si studiano limiti, derivate, integrali e le loro applicazioni, con particolare attenzione alla comprensione teorica e alla risoluzione di problemi pratici.' }
    });
  }
}