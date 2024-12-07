import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../servizi/firebase.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-esame',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './esame.component.html',
  styleUrl: './esame.component.css'
})
export class EsameComponent {
  esameId! : string;
  esameData : any;

  constructor(private route: ActivatedRoute, private firebaseService: FirebaseService, private router: Router) {}

  ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('id') || "";
    this.loadEsameDetails();
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
