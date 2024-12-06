import { Injectable } from '@angular/core';
import { FirebaseService } from '../servizi/firebase.service';
import { getAuth, sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, User} from 'firebase/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  // auth permette di interagire con firebase authentication, usando funzioni come:
  // createUserWithEmailAndPassword(auth: Auth, email: string, password: string)
  // signInWithEmailAndPassword(auth: Auth, email: string, password: string)
  // entrambe ritornano un oggetto di credenziali dell'utente (UserCredential)
  private auth = getAuth();
  private currentUser: User | null = null;
  private userSubject = new BehaviorSubject<any>(null);
  private userData: any = null;

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

    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserData(user.uid)
      } else {
        this.userSubject.next(null);
        this.isLoggedIn = false;
      }
    });

    this.startInactivityTimer();
  }

    // passo parametro perché viene chiamata anche da create-exam-component
  async loadUserData(uid: string): Promise<void> {
    const ruolo = this.currentUser?.email?.includes('docente') ? 'docente' : 'studente';
    try {
      const userData = await this.firebaseService.getUserData(uid, ruolo);
      this.userData = userData
      this.userSubject.next(userData); // Emit updated data to observers
    } catch (error) {
      console.log('Error fetching user data', error);
    }
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
    const user = userCredential.user; // contiene i campi .email, .emailVerified, .uid ...

    // Invio email di verifica
    await sendEmailVerification(user);
    console.log('Email di verifica inviata a:', email); // o anche user.email

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
    const user = userCredential.user; // contiene i campi .email, .emailVerified, .uid ...

     if (user.emailVerified) {
      this.isLoggedIn = true;
      localStorage.setItem('user', email); // o anche user.email
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
      this.router.navigate(['/login']);
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

  getUserRole(): string {
    return this.currentUser?.email?.includes('docente') ? 'docente' : 'studente';
  }

  getUserObservable() {
    return this.userSubject.asObservable();
  }

  getUid(): string | null {
    return this.currentUser ? this.currentUser.uid : null;
  }

  async updateUserField(field: string, value: any): Promise<void> {
    if (!this.currentUser) return;
    const uid = this.currentUser.uid;
    const ruolo = this.getUserRole();
    await this.firebaseService.updateUserField(uid, ruolo, field, value);
    this.loadUserData(uid); 
  }
  
}
