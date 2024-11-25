import { AfterViewInit, Component, OnInit } from '@angular/core';
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


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule, MatListModule, ConfirmDialogComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit{
  nome = '';
  cognome = '';
  ruolo = '';
  avatar = '';
  avatarUrl = '';

  isSidebarOpen = false;
  isSidebarOpenWithClick = false; // true se l'utente decide di aprire tramite click. Se la apre passandoci con il mouse, rimane false
  isInitialLoad = true; // fa sì che inizialmente "transition: none !important", per risolvere un bug
  
  constructor(private authService: AuthService, private firebaseService: FirebaseService, private dialog: MatDialog){}

  ngOnInit(): void {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        this.ruolo = user.email?.includes('docente') ? 'docente' : 'studente';

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
  }

  private getAvatarUrl(): string {
    if (this.avatar === 'Default') {
      return 'assets/avatar/default.jpg'; 
    } else {
      const avatarNumber = this.avatar.split(' ')[1];
      return `assets/avatar/avatar${avatarNumber}.jpg`;
    }
  }

  ngAfterViewInit(): void {
    // Riattivo le transizioni, che avevo disattivato causa bug
    setTimeout(() => {
      this.isInitialLoad = false;
    }, 300); 
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.isSidebarOpenWithClick = !this.isSidebarOpenWithClick;
  }

  onMouseEnter(): void {
    if (!this.isSidebarOpen) {
      this.isSidebarOpen = true; // Allarga la sidebar al passaggio del mouse
    }
   }

  onMouseLeave(): void {
    // se la sidebar è stata aperta senza il click (quindi passando con il mouse), deve chiudersi una volta usciti col mouse
    // se la sidebar è stata aperta con il click sulla toolbar, NON deve restringersi una volta usciti con il mouse!
    if (!this.isSidebarOpenWithClick && this.isSidebarOpen) { 
      this.isSidebarOpen = false; // Restringi la sidebar quando il mouse esce
    }
  }

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