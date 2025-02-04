import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../../servizi/firebase/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateDomandaDialogComponent } from '../../dialoghi/create/create-domanda-dialog/create-domanda-dialog.component';
import { AuthService } from '../../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CreatePoolDialogComponent } from '../../dialoghi/create/create-pool-dialog/create-pool-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from '../../dialoghi/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-domande',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  templateUrl: './domande.component.html',
  styleUrl: './domande.component.css'
})
export class DomandeComponent {
  esameId!: string;
  domande: any[] = [];
  selectedDomande: any[] = [];
  isLoading = true;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, private firebaseService: FirebaseService, private dialog: MatDialog) {}

  async ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('idEsame') || '';

    this.firebaseService.getQuestionService().listenToDomandeInEsame(this.esameId).subscribe((domande) => {
        this.loadDomande(domande);
        this.isLoading = false;
      });
  }

  async loadDomande(domandeID: string[]) {
    const domandePromises = domandeID.map(async (domandaId: string) => {
      
      const domanda = await this.firebaseService.getQuestionService().getDomandaById(domandaId);
      domanda.selected = false; 
      return domanda;
    });

    this.domande = await Promise.all(domandePromises);
  }

  openCreateDomandaDialog(): void {
    const dialogRef = this.dialog.open(CreateDomandaDialogComponent, {
      width: '380px',
      data: { esameId: this.esameId }
    });
  }

  // Gestisce il cambiamento nella selezione delle domande
  onSelectionChange() {
    this.selectedDomande = this.domande.filter((domanda) => domanda.selected);
  }

  onRemove(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Conferma eliminazione', message: 'Sei sicuro di voler eliminare le domande selezionate?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      // se viene cliccato "Sì" ...
      if (result) {
        this.removeDomande();
      }
    });
  }

  // Metodo per rimuovere le domande selezionate
  private async removeDomande() {
    const selectedDomandeIds = this.selectedDomande.map((domanda) => domanda.id);

    try {

      await this.firebaseService.getQuestionService().removeDomande(selectedDomandeIds, this.esameId);

      this.selectedDomande = [];
      console.log('Domande rimosse con successo');
    } catch (error) {
      console.error('Errore nella rimozione delle domande:', error);
    }
  }

  openCreatePoolDialog(): void {
    const selectedDomandeIds = this.selectedDomande.map(domanda => domanda.id);

    const dialogRef = this.dialog.open(CreatePoolDialogComponent, {
      width: '350px',
      data: { esameId: this.esameId, domandeId: selectedDomandeIds }
    });
  }

}
