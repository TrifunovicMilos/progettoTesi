import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../../servizi/firebase/firebase.service';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CreateTestDialogComponent } from '../../dialoghi/create/create-test-dialog/create-test-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from '../../dialoghi/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-esame',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterLink, MatButtonModule],
  templateUrl: './esame.component.html',
  styleUrl: './esame.component.css'
})
export class EsameComponent {
  isLoading = true;
  esameId! : string;
  esameData : any;
  ruolo = '';
  uid = '';
  pools: any[] = [];
  tipiTest: any[] = [];

  constructor(private route: ActivatedRoute, private authService: AuthService, private firebaseService: FirebaseService, private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('idEsame') || "";

    this.firebaseService.getTestService().listenToTestInEsame(this.esameId).subscribe((tipiTest) => {
      this.loadEsameDetails();
      this.isLoading = false;
    });

    this.authService.getUserObservable().subscribe(userData => {
      if (userData) {
        this.uid = this.authService.getUid() || '';
        this.ruolo = this.authService.getUserRole();
        this.loadEsameDetails().then(() => {
          this.isLoading = false;
        });
      }
    });
  }

  async loadEsameDetails() {
    try {
      this.esameData = await this.firebaseService.getExamService().getEsameById(this.esameId);
      const poolIds = this.esameData.pool || [];
      this.loadPools(poolIds);
      const tipiTestIds = this.esameData.tipiTest || [];
      this.loadTipiTest(tipiTestIds);
    } catch (error: any) {
      this.router.navigate(['404'])
      if(error.message == 'Esame non trovato.')
        console.log(error.message)
      else
        console.log('Errore recupero esame')
    }
  
  }

  async loadPools(poolID: string[]) {
    const poolPromises = poolID.map(async (poolId: string) => {
      
      const pool = await this.firebaseService.getQuestionService().getPoolById(poolId);
      return pool;
    });

    this.pools = await Promise.all(poolPromises);
  }

  async loadTipiTest(tipiTestID: string[]) {
    const tipiTestPromises = tipiTestID.map(async (tipiTestId: string) => {
      
      const tipiTest = await this.firebaseService.getTestService().getTipoTestById(tipiTestId);
      return tipiTest;
    });

    this.tipiTest = await Promise.all(tipiTestPromises);
  }

  openCreateTestDialog(): void {
    const dialogRef = this.dialog.open(CreateTestDialogComponent, {
      width: '37%',
      data: { esameId: this.esameId, pools: this.pools }
    });
  }

  onUnsubscribe(){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: "Disiscrizione dall'esame", message: `Sei sicuro di volerti disiscrivere da '${this.esameData.titolo}?'` }
    });

    dialogRef.afterClosed().subscribe(async result => {
      // se viene cliccato "Sì" ...
      if (result) {
        try{
          await this.firebaseService.getExamService().removeEsameFromUser(this.uid, 'studente', this.esameId);
          await this.authService.loadUserData(this.uid);
        } catch (error) {
          console.error('Errore nella disiscrizone: ', error);
        }
        finally{
          this.router.navigate([`home`]);
        }
      }
    });
  }

}
