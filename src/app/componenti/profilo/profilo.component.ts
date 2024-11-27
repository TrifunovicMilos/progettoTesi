import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../servizi/firebase.service';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatOptionModule],
  templateUrl: './profilo.component.html',
  styleUrl: './profilo.component.css'
})
export class ProfiloComponent implements OnInit {
  nome = '';
  cognome = '';
  ruolo = '';
  email = '';
  userAvatar = ''; // avatar associato all'utente
  selectedAvatar = ''; // avatar selezionato al momento nel mat-select
  selectedAvatarUrl = '';
  isLoading = true; // Stato del caricamento

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.email = user.email ?? ''; // se null o undefined diventa strigna vuota
        const uid = user.uid;
        // ottengo il ruolo/collezione
        this.ruolo = this.email.includes('docente') ? 'docente' : 'studente';

        try {
          const userData = await this.firebaseService.getUserData(uid, this.ruolo);
          this.nome = userData.nome;
          this.cognome = userData.cognome;
          this.userAvatar = userData.avatar || 'Default'; 
          this.selectedAvatar = userData.avatar || 'Default'; 
          this.selectedAvatarUrl = this.getAvatarUrl();
        } catch (error) {
          console.log('Errore nel recupero dei dati utente');
        } finally {
          setTimeout(() => {
            this.isLoading = false; // Disattiva il caricamento
          }, 200); // delay in modo tale che il caricamento non duri mai meno di 200ms (non piacevole da vedere)
        }
      } else {
        console.log('Utente non autenticato');
        this.isLoading = false; // Disattiva il caricamento
      }
    });
  }

  private getAvatarUrl(): string {
    if (this.selectedAvatar === 'Default') {
      return 'assets/avatar/default.jpg'; 
    } else {
      const avatarNumber = this.selectedAvatar.split(' ')[1];
      return `assets/avatar/avatar${avatarNumber}.jpg`;
    }
  }

  // chiamata quando scelgo un avatar dalla lista
  onSelect(event: any): void {
    this.selectedAvatar = event.value
    this.selectedAvatarUrl = this.getAvatarUrl(); // si aggiorna l'avatar mostrato
  }
  
  // click bottone di conferma Avatar
  onConfirmChange(): void {
    console.log('Avatar cambiato a: ', this.selectedAvatar);
    this.userAvatar = this.selectedAvatar;

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const uid = user.uid;

      this.firebaseService.updateUserAvatar(uid, this.ruolo, this.selectedAvatar)
      .then(() => {
        console.log('Avatar aggiornato con successo!');
      })
      .catch((error) => {
        console.error('Errore nell\'aggiornamento dell\'avatar:', error);
      });
    }
  }
}
