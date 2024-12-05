import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { AuthService } from '../../auth/auth.service';
import { FirebaseService } from '../../servizi/firebase.service';

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
  isLoading = false; // Stato del caricamento, per ora metto sempre false perche si carica sempre veloce

  constructor(private authService: AuthService, private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.authService.getUserObservable().subscribe(userData => {
      if(userData) {
        this.email = userData.email;
        this.ruolo = this.authService.getUserRole();
        this.nome = userData.nome;
        this.cognome = userData.cognome;
        this.userAvatar = userData.avatar || 'Default';
        this.selectedAvatar = userData.avatar || 'Default';
        this.selectedAvatarUrl = this.getAvatarUrl();
        this.isLoading = false;
      }
    });
  }

  // chiamata ogni volta che cambio Avatar per cambiare anche il selectedAvatarUrl
  // gli avatar sono di tipo "Avatar X", mentre gli url /avatarX
  // quindi estraggo X e la concateno con "avatar"
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
  // il form non me lo fa fare se userAvatar = selectedAvatar
  onConfirmChange(): void {
    console.log('Avatar cambiato a: ', this.selectedAvatar);
    this.userAvatar = this.selectedAvatar;
    const uid = this.authService.getUid();

    this.authService.updateUserField('avatar', this.selectedAvatar)
      .then(() => {
        console.log('Avatar aggiornato con successo!');
      })
      .catch((error) => {
        console.error('Errore nell\'aggiornamento dell\'avatar:', error);
      });
  }
}
