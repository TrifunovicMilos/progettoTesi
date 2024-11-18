import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../servizi/firebase.service';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profilo.component.html',
  styleUrl: './profilo.component.css'
})
export class ProfiloComponent implements OnInit {
  nome: string = '';
  cognome: string = '';
  ruolo: string = '';
  email: string = '';
  isLoading: boolean = true; // Stato del caricamento

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.email = user.email ?? ''; // se null o undefined diventa strigna vuota
        const uid = user.uid;
        this.ruolo = this.email.includes('docente') ? 'docente' : 'studente';

        try {
          const userData = await this.firebaseService.getUserData(uid, this.ruolo);
          this.nome = userData.nome;
          this.cognome = userData.cognome;
        } catch (error) {
          console.log('Errore nel recupero dei dati utente:');
        } finally {
          setTimeout(() => {
            this.isLoading = false; // Disattiva il caricamento
          }, 100);
        }
      } else {
        console.log('Utente non autenticato');
        this.isLoading = false; // Disattiva il caricamento
      }
    });
  }
}
