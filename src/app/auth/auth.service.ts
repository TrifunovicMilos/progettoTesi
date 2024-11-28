import { Injectable } from '@angular/core';
import { FirebaseService } from '../servizi/firebase.service';
import { getAuth, sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail} from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

//TODO: gestione della sessione

export class AuthService {

  private auth = getAuth();
  isLoggedIn = false;
  private inactivityTimer: any = null;
  private logoutTime = 10 * 1000; // numero di millisecondi, per testare uso 10 secondi
  
  constructor(private firebaseService: FirebaseService, private router: Router) {
    const user = sessionStorage.getItem('user');
    if (user)
    this.isLoggedIn = true;
    else
    this.isLoggedIn = false;

    this.startInactivityTimer();
  }

  private startInactivityTimer() {
    // reset del timer ogni volta che l'utente interagisce con la pagina
    window.onload = () => this.resetInactivityTimer();
    window.onclick = () => this.resetInactivityTimer();
    window.onmousemove = () => this.resetInactivityTimer();
    window.onkeyup = () => this.resetInactivityTimer();
    window.onkeydown = () => this.resetInactivityTimer();
  }

  private resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // logout automatico dopo il periodo di inattività
    this.inactivityTimer = setTimeout(() => {
      this.logout();
    }, this.logoutTime);
  }
  
  // funzione chiamata dalla sezione Registrazione in LoginComponent al click del bottone "Registrati"
  async signUp(email: string, password: string): Promise<void> {

    // Registrazione utente tramite Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    // Invio email di verifica
    await sendEmailVerification(user);
    console.log('Email di verifica inviata a:', email);

    let [nome, cognome, ruolo] = email.split('@')[0].split('.'); // Estrazione nome, cognome e ruolo
    nome = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase(); // prima lettera maiuscola
    cognome = cognome.charAt(0).toUpperCase() + cognome.slice(1).toLowerCase(); // prima lettera maiuscola

    // Aggiungi l'utente a Firestore
    // di default, l'ID del documento creato è casuale. Impongo IDdocumento (firestore) = UIDutente (firebase auth)
    await this.firebaseService.addUserToFirestore( user.uid, nome, cognome, email, ruolo);

    console.log('Utente registrato con successo'); 
  }

  // funzione chiamata dalla sezione Login in LoginComponent al click del bottone "Accedi"
  async login(email: string, password: string): Promise<void> {

    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

     if (user.emailVerified) {
      this.isLoggedIn = true;
      sessionStorage.setItem('user', email);
      this.router.navigate(['']);
    } else {
      throw new Error('Email non verificata.');
    } 

  }
  
  // funzione chiamata in DashboardComponent al click sull'icona di Logout
  async logout(): Promise<void> {

    try {
      await signOut(this.auth);
      sessionStorage.removeItem('user');
      this.isLoggedIn = false;
      console.log('Logout effettuato con successo');
      this.router.navigate(['/signin']);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  }

  // funzione chiamata da onForgotPasswordSubmit() in ForgotPasswordDialogComponent
  // (finestra che si apre al click di "Password Dimenticata" nella sezione di Login)
  async resetPassword(email: string): Promise<void> {
      await sendPasswordResetEmail(this.auth, email);
      console.log('Email per il reset della password inviata a: ', email);
  }

}
