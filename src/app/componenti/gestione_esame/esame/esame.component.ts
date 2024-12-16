import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../../servizi/firebase/firebase.service';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-esame',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterLink],
  templateUrl: './esame.component.html',
  styleUrl: './esame.component.css'
})
export class EsameComponent {
  isLoading = true;
  esameId! : string;
  esameData : any;
  ruolo = '';
  esamiUtente! : any[]; // per controllare se il docente o studente può accedere alla pagina dell'esame
  pools: any[] = [];

  constructor(private route: ActivatedRoute, private authService: AuthService, private firebaseService: FirebaseService, private router: Router) {}

  ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('id') || "";
    this.authService.getUserObservable().subscribe(userData => {
      if (userData) {
        this.ruolo = this.authService.getUserRole();
        this.esamiUtente = userData.esami || '';
        // se non ho questo esame nella lista (di esami a cui sono iscritto o che gestisco) visualizzo un errore
        if(!this.esamiUtente.includes(this.esameId))
          this.router.navigate(['exam-denied'])
        else
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

}
