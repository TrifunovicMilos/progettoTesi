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

  ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('idEsame') || "";
    console.log('Esame ID:', this.esameId)
    this.loadDomande().then(() => {
      this.isLoading = false;
    });
  }

  async loadDomande() {
    try {
      const esameData = await this.firebaseService.getEsameById(this.esameId);
      this.domande = esameData.domande || [];
    } catch (error: any) {
      console.log(error);
    }
  }

  openCreateDomandaDialog(): void {
    const dialogRef = this.dialog.open(CreateDomandaDialogComponent, {
      width: '37%',
      data: { esameId: this.esameId }
    });
  }

}
