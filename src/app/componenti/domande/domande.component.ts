import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../servizi/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateDomandaDialogComponent } from '../dialoghi/create-domanda-dialog/create-domanda-dialog.component';

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

  constructor(private route: ActivatedRoute, private router: Router, private firebaseService: FirebaseService, private dialog: MatDialog) {}

  async ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('idEsame') || "";
    try {
      const esameData = await this.firebaseService.getEsameById(this.esameId);
      const domandeID = esameData.domande || [];
      this.loadDomande(domandeID).then(() => {
        this.isLoading = false;
      });
    } catch (error) {
      console.error('Errore nel recupero dei dati dell\'esame:', error);
      this.isLoading = false; 
    }
  }

  async loadDomande(domandeID: string[]) {
    const domandePromises = domandeID.map(async (domandaId: string) => {
      return await this.firebaseService.getDomandaById(domandaId);
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
