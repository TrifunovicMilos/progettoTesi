import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../servizi/firebase.service';

@Component({
  selector: 'app-esame',
  standalone: true,
  imports: [],
  templateUrl: './esame.component.html',
  styleUrl: './esame.component.css'
})
export class EsameComponent {
  esameId! : string;
  esameData : any;

  constructor(private route: ActivatedRoute, private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.esameId = this.route.snapshot.paramMap.get('id') || "";
    this.loadEsameDetails();
  }

  async loadEsameDetails() {
    try {
      this.esameData = await this.firebaseService.getEsameById(this.esameId);
      console.log(this.esameData); 
    } catch (error: any) {
      if(error.message == 'Esame non trovato.')
        console.log(error.message)
      else
        console.log('Errore recupero esame')

    }
  }

}
