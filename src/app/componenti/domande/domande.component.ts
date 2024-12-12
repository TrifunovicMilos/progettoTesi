import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../servizi/firebase/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateDomandaDialogComponent } from '../dialoghi/create-domanda-dialog/create-domanda-dialog.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-domande',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './domande.component.html',
  styleUrl: './domande.component.css'
})
export class DomandeComponent {
  esameId!: string;
  domande: any[] = [];
  isLoading = true;

  constructor(private route: ActivatedRoute, private router: Router, private authService:AuthService, private firebaseService: FirebaseService, private dialog: MatDialog) {}

  async ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('idEsame') || "";
    
    this.firebaseService.getQuestionService().listenToDomandeInEsame(this.esameId).subscribe((domande) => {
      const domandeID = domande;
      this.loadDomande(domandeID)
      this.isLoading = false
    });

    this.authService.getUserObservable().subscribe(userData => {
      if (userData) {
        const uid = this.authService.getUid() || '';
        const ruolo = this.authService.getUserRole();
        const esamiUtente = userData.esami || '';
        
        // se non sono il docente di questo esame visualizzo un errore
        if(!(esamiUtente.includes(this.esameId) && ruolo === 'docente'))
          this.router.navigate(['exam-denied'])
        else
          this.isLoading = false;
      }
    });
  }

  async loadDomande(domandeID: string[]) {
    const domandePromises = domandeID.map(async (domandaId: string) => {
      return await this.firebaseService.getQuestionService().getDomandaById(domandaId);
    });

    this.domande = await Promise.all(domandePromises);
  }

  openCreateDomandaDialog(): void {
    const dialogRef = this.dialog.open(CreateDomandaDialogComponent, {
      width: '37%',
      data: { esameId: this.esameId }
    });
  }

}
