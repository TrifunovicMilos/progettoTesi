import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../servizi/firebase/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateDomandaDialogComponent } from '../dialoghi/create-domanda-dialog/create-domanda-dialog.component';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CreatePoolDialogComponent } from '../dialoghi/create-pool-dialog/create-pool-dialog.component';

@Component({
  selector: 'app-domande',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        const domandeID = domande;
        this.loadDomande(domandeID);
        this.isLoading = false;
      });

    this.authService.getUserObservable().subscribe((userData) => {
      if (userData) {
        const uid = this.authService.getUid() || '';
        const ruolo = this.authService.getUserRole();
        const esamiUtente = userData.esami || '';

        // se non sono il docente di questo esame visualizzo un errore
        if (!(esamiUtente.includes(this.esameId) && ruolo === 'docente'))
          this.router.navigate(['exam-denied']);
        else this.isLoading = false;
      }
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
      width: '37%',
      data: { esameId: this.esameId }
    });
  }

  // Gestisce il cambiamento nella selezione delle domande
  onSelectionChange() {
    this.selectedDomande = this.domande.filter((domanda) => domanda.selected);
  }

  openCreatePoolDialog(): void {
    const selectedDomandeIds = this.selectedDomande.map(domanda => domanda.id);

    const dialogRef = this.dialog.open(CreatePoolDialogComponent, {
      width: '37%',
      data: { esameId: this.esameId, domandeId: selectedDomandeIds }
    });
  }

}
