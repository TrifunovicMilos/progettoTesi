import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../../servizi/firebase/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateDomandaDialogComponent } from '../../dialoghi/create-domanda-dialog/create-domanda-dialog.component';
import { AuthService } from '../../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CreatePoolDialogComponent } from '../../dialoghi/create-pool-dialog/create-pool-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from '../../dialoghi/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-pool',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './pool.component.html',
  styleUrl: './pool.component.css'
})
export class PoolComponent {
  esameId!: string;
  poolId!: string;
  domande: any[] = [];
  selectedDomande: any[] = [];
  isLoading = true;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, private firebaseService: FirebaseService, private dialog: MatDialog) {}

  async ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('idEsame') || '';
    this.poolId = this.route.snapshot.paramMap.get('idPool') || '';

    this.firebaseService.getQuestionService().listenToDomandeInPool(this.poolId).subscribe((domande) => {
        this.loadDomande(domande);
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

  openCreateDomandaDialog(): void {}

  onSelectionChange() {
    this.selectedDomande = this.domande.filter((domanda) => domanda.selected);
  }

  onRemove(): void {}

  private async removeDomande() {}

}
