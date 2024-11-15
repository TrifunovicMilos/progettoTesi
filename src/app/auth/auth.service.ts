import { Injectable } from '@angular/core';
import { FirebaseService } from '../servizi/firebase.service';
import { getAuth, sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  isLoggedIn = false
  
  constructor(private firebaseService: FirebaseService, private router: Router) {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (user) {
      this.isLoggedIn = true;
    }
    else{
      this.isLoggedIn = false;
    }
  }

  async signUp(utente: any): Promise<void> {
    const auth = getAuth();

    try {
      // Registrazione utente tramite Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        utente.email,
        utente.password
      );
      const user = userCredential.user;

      // Invio email di verifica
      await sendEmailVerification(user);
      console.log('Email di verifica inviata a:', utente.email);

      const [nome, cognome, ruolo] = utente.email.split('@')[0].split('.'); // Estrazione nome, cognome e ruolo

      // Aggiungi l'utente a Firestore
      await this.firebaseService.addUserToFirestore(
        user.uid,
        nome,
        cognome,
        utente.email,
        ruolo
      );

      console.log('Utente registrato con successo e email di verifica inviata');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw error;
      } else {
        console.error(error);
        alert('Si è verificato un errore durante la registrazione.');
      }
    }
  }

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
      console.log('Errore di login');
      throw error;
    }
  }

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
