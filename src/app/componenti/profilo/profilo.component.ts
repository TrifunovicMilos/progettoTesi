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
  nome: string = '';
  cognome: string = '';
  ruolo: string = '';
  email: string = '';
  initialAvatar = ''; //avatar iniziale
  selectedAvatar = '';
  selectedAvatarUrl = '';
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
          this.initialAvatar = userData.avatar || 'Default'; 
          this.selectedAvatar = userData.avatar || 'Default'; 
          this.selectedAvatarUrl = this.getAvatarUrl();
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

  getAvatarUrl(){
    if (this.selectedAvatar === 'Default') {
      return 'assets/avatar/default.jpg'; 
    } else {
      const avatarNumber = this.selectedAvatar.split(' ')[1];
      return `assets/avatar/avatar${avatarNumber}.jpg`;
    }
  }

  onSelect(event: any): void {
    this.selectedAvatar = event.value
    this.selectedAvatarUrl = this.getAvatarUrl();
  }

  onConfirmChange(): void {
    console.log('Avatar cambiato a:', this.selectedAvatar);

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
