import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FirebaseService } from '../../servizi/firebase.service';
import { SidebarService } from '../../servizi/sidebar.service';
import { slideInAnimation } from '../../animations';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule, MatListModule, ConfirmDialogComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  animations: [
    slideInAnimation
  ]
})

export class DashboardComponent implements OnInit{
  // campi mostrati nell'header
  nome = '';
  cognome = '';
  ruolo = '';
  avatar = '';
  avatarUrl = '';

  isSidebarOpen = false;
  isSidebarOpenWithClick = false; // true se l'utente decide di aprire tramite click. Se la apre passandoci con il mouse, rimane false
  
  constructor(private authService: AuthService, private firebaseService: FirebaseService, private sidebarService: SidebarService, private dialog: MatDialog){}

  ngOnInit(): void {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        this.ruolo = user.email?.includes('docente') ? 'docente' : 'studente';
        
        // ascolta i cambiamenti nel db, per poter aggiornare i dati nell'header istantaneamente, quando vengono cambiati in Profilo
        this.firebaseService.listenToUserData(uid, this.ruolo).subscribe((userData) => {
          if (userData) {
            this.nome = userData.nome;
            this.cognome = userData.cognome;
            this.avatar = userData.avatar || 'Default';
            this.avatarUrl = this.getAvatarUrl();
          }
        });
      } else {
        console.log('Utente non autenticato');
      }
    });
    
    // lo stato della sidebar influenza le classi css delle componenti, perché ha impatto sullo spazio disponibile a destra
    this.sidebarService.sidebarState$.subscribe(state => {
      this.isSidebarOpen = state; 
    })
  }
  
  // chiamata nella funzione sopra per aggiornare avatarUrl (foto mostrata nell'header)
  private getAvatarUrl(): string {
    if (this.avatar === 'Default') {
      return 'assets/avatar/default.jpg'; 
    } else {
      const avatarNumber = this.avatar.split(' ')[1];
      return `assets/avatar/avatar${avatarNumber}.jpg`;
    }
  }
  
  // apertura/chiusura sidebar tramite click sul menu
  toggleSidebar(): void {
    this.sidebarService.toggleSidebar()
    this.isSidebarOpenWithClick = !this.isSidebarOpenWithClick;
  }
  
  // apertura sidebar al passaggio del mouse
  onMouseEnter(): void {
    if (!this.isSidebarOpen) {
      this.sidebarService.setSidebarState(true); 
    }
   }

  onMouseLeave(): void {
    // se la sidebar è stata aperta senza il click (quindi passando con il mouse), deve chiudersi una volta usciti col mouse
    // se la sidebar è stata aperta con il click sulla toolbar, NON deve restringersi una volta usciti con il mouse!
    if (!this.isSidebarOpenWithClick && this.isSidebarOpen) { 
      this.sidebarService.setSidebarState(false); // Restringi la sidebar quando il mouse esce
    }
  }
  
  // apre un dialog al quale bisogna passare titolo e messaggio
  onLogout(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Conferma Logout', message: 'Sei sicuro di voler uscire?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      // se viene cliccato "Sì" ...
      if (result) {
        this.authService.logout();  
      }
    });
  }

}