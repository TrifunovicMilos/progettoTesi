import { Injectable } from '@angular/core';
import { FirebaseService } from '../servizi/firebase.service';
import { getAuth, sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

//TODO: gestione della sessione

export class AuthService {

  isLoggedIn = false
  
  constructor(private firebaseService: FirebaseService, private router: Router) {
    this.checkLoginStatus()
  }

  checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (user)
    this.isLoggedIn = true;
    else
    this.isLoggedIn = false;
  }
  
  // funzione chiamata dalla sezione Registrazione in LoginComponent al click del bottone "Registrati"
  async signUp(email: string, password: string): Promise<void> {
    const auth = getAuth();

    try {
      // Registrazione utente tramite Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Invio email di verifica
      await sendEmailVerification(user);
      console.log('Email di verifica inviata a:', email);

      let [nome, cognome, ruolo] = email.split('@')[0].split('.'); // Estrazione nome, cognome e ruolo
      nome = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase(); // prima lettera maiuscola
      cognome = cognome.charAt(0).toUpperCase() + cognome.slice(1).toLowerCase(); // prima lettera maiuscola

      // Aggiungi l'utente a Firestore
      await this.firebaseService.addUserToFirestore( user.uid, nome, cognome, email, ruolo);

      console.log('Utente registrato con successo e email di verifica inviata'); 
    } catch (error: any) {
      throw error; // gestito da LoginComponent
    }
  }

  // funzione chiamata dalla sezione Login in LoginComponent al click del bottone "Accedi"
  async login(email: string, password: string): Promise<void> {
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if(user.emailVerified) {
        this.isLoggedIn = true;
        localStorage.setItem('user', email);
        this.router.navigate(['']);
      }
      else{
        throw new Error('Email non verificata. ');
      }   
    } catch (error: any) {
      throw error; // gestito da LoginComponent
    }
  }
  
  // funzione chiamata in DashboardComponent al click sull'icona di Logout
  async logout(): Promise<void> {
    const auth = getAuth();
    
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      this.isLoggedIn = false;
      console.log('Logout effettuato con successo');
      this.router.navigate(['/signin']);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  }

}
