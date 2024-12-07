import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../servizi/firebase.service';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-esame',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './esame.component.html',
  styleUrl: './esame.component.css'
})
export class EsameComponent {
  isLoading = true;
  esameId! : string;
  esameData : any;
  uid: any;
  esamiUtente! : any[]; // per controllare se il docente o studente può accedere alla pagina dell'esame

  constructor(private route: ActivatedRoute, private authService: AuthService, private firebaseService: FirebaseService, private router: Router) {}

  ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('id') || "";
    this.authService.getUserObservable().subscribe(userData => {
      if (userData) {
        this.uid = this.authService.getUid() || '';
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
      this.esameData = await this.firebaseService.getEsameById(this.esameId);
    } catch (error: any) {
      this.router.navigate(['404'])
      if(error.message == 'Esame non trovato.')
        console.log(error.message)
      else
        console.log('Errore recupero esame')
    }
  }

}
