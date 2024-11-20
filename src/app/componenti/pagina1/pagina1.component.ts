import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';

@Component({
  selector: 'app-pagina1',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule, MatIconModule],
  templateUrl: './pagina1.component.html',
  styleUrl: './pagina1.component.css'
})
export class Pagina1Component {

  constructor(private dialog: MatDialog){}

  // per ora esami con titolo e descrizioni uguali
  onClickInfo(): void {
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      data: { title: 'Descrizione Corso', message: 'Questo corso fornisce le basi del calcolo differenziale e integrale per funzioni reali di una variabile. Si studiano limiti, derivate, integrali e le loro applicazioni, con particolare attenzione alla comprensione teorica e alla risoluzione di problemi pratici.' }
    });
  }

}
