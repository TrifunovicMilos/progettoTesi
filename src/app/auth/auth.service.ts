import { Injectable } from '@angular/core';
import { FirebaseService } from '../servizi/firebase.service';
import { throwError } from 'rxjs';
import { getAuth, sendEmailVerification, createUserWithEmailAndPassword } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDC5n7iWZK43g6NixBX7SbS-rs3akW-DOk"
  
  // isLoggedIn = true
  // isAdmin = true;

  constructor(private firebaseService: FirebaseService) { }

  // isAuthenticated(){
  //   return this.isLoggedIn
  // }

  // isRoleAdmin(){
  //   return this.isAdmin;
  // }

  async signUp(utente: any): Promise<void>  {
    const auth = getAuth();
    
    try {
      // Registrazione utente tramite Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, utente.email, utente.password);
      const user = userCredential.user;
      
      // Invio email di verifica
      await sendEmailVerification(user);
      console.log('Email di verifica inviata a:', utente.email);
      
      const [nome, cognome] = utente.email.split('@')[0].split('.');  // Estrazione nome e cognome
      const ruolo = utente.email.includes("studenti") ? "studente" : "docente";  // Determinazione ruolo utente
      
      // Aggiungi l'utente a Firestore
      await this.firebaseService.addUserToFirestore(user.uid, nome, cognome, utente.email, ruolo);
      
      console.log('Utente registrato con successo e email di verifica inviata');
      
    } catch (error) {
      console.error('Errore durante la registrazione o l’invio dell’email di verifica', error);
      throwError;
    }
  }
}

