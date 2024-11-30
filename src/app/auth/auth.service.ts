import { Injectable } from '@angular/core';
import { FirebaseService } from '../servizi/firebase.service';
import { getAuth, sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail} from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

// TODO: migliorare gestione della sessione, 
// con localstorage al posto di sessionstorage il login viene mantenuto anche chiudendo e riaprendo broswer (anche riaprendolo dopo ore)
// con sessionstorage non viene mantenuto, ma non viene mantentuto nemmeno aprendo una nuova tab nel browser
// TODO: trovare una soluzione, voglio che aprendo nuove tab rimanga il login, ma non se riapro il browser
// soluzione temporanea (codice commentato con ***):
// - salvare in localstorage l'istante dell'ultima interazione con la pagina
// - se l'ultima interazione è stata fatta tanto tempo fa (30 min fa), mi rimanda al login
// - altrimenti no. In questo modo, se riapro il browser entro 30min sarò comunque loggato automaticamente, ma non se lo riapro dopo 30 minuti.

export class AuthService {

  private auth = getAuth();
  isLoggedIn = false;
  private inactivityTimer: any = null;
  private logoutTime = 30 * 60 * 1000; // numero di millisecondi, per testare provare con 10 secondi (logoutTime = 10 * 1000)
  
  constructor(private firebaseService: FirebaseService, private router: Router) {
    const user = localStorage.getItem('user');
    const lastActive = localStorage.getItem('lastActive'); //***
    if (user && lastActive) {
      const now = new Date().getTime(); //***
      const elapsedTime = now - parseInt(lastActive, 10); //***
      if (elapsedTime < this.logoutTime) { //***
        this.isLoggedIn = true;
      } else {
        this.logout(); //***
      }
    } else {
      this.isLoggedIn = false;
    }

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

    // Salva l'orario dell'ultima interazione
    localStorage.setItem('lastActive', new Date().getTime().toString()); //***

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
      localStorage.setItem('user', email);
      localStorage.setItem('lastActive', new Date().getTime().toString()); //*** Salva l'orario dell'accesso
      this.router.navigate(['']);
    } else {
      throw new Error('Email non verificata.');
    } 

  }
  
  // funzione chiamata in DashboardComponent al click sull'icona di Logout
  async logout(): Promise<void> {

    try {
      await signOut(this.auth);
      localStorage.removeItem('user');
      localStorage.removeItem('lastActive'); //***
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
