import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { FirebaseService } from '../../../servizi/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tipo-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './tipo-test.component.html',
  styleUrl: './tipo-test.component.css'
})
export class TipoTestComponent implements OnInit{
  isLoading = true;
  esameId!: string;
  tipoTestId!: string;
  testData : any;
  ruolo = '';

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, private firebaseService: FirebaseService) {}


  ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('idEsame') || '';
    this.tipoTestId = this.route.snapshot.paramMap.get('idTipoTest') || '';

    this.authService.getUserObservable().subscribe(userData => {
      if (userData) {
        this.ruolo = this.authService.getUserRole();
        const esamiUtente = userData.esami || '';
        // se non ho questo esame nella lista (di esami a cui sono iscritto o che gestisco) visualizzo un errore
        if(!esamiUtente.includes(this.esameId))
          this.router.navigate(['exam-denied'])
        else
          this.loadTestDetails().then(() => {
            this.isLoading = false;
          });
      }
    });
  }

  async loadTestDetails() {
    try {
      this.testData = await this.firebaseService.getTestService().getTipoTestById(this.tipoTestId)
    } catch (error: any) {
      this.router.navigate(['404'])
      if(error.message == 'Test non trovato.')
        console.log(error.message)
      else
        console.log('Errore recupero test')
    }
  }

}
