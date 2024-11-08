import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FirebaseService } from '../servizi/firebase.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDC5n7iWZK43g6NixBX7SbS-rs3akW-DOk"
  
  // isLoggedIn = true
  // isAdmin = true;

  constructor(private http: HttpClient, private firebaseService: FirebaseService) { }

  // isAuthenticated(){
  //   return this.isLoggedIn
  // }

  // isRoleAdmin(){
  //   return this.isAdmin;
  // }

  signUp(utente: any) {
    return this.http.post(this.url, utente).pipe(
      tap(async (response: any) => {
        
        const uid = response.localId; //UID da firebase auth
        const email = utente.email;
        const [nome, cognome] = email.split('@')[0].split('.');  // Estrazione nome e cognome
        const ruolo = email.includes("studenti") ? "studente" : "docente";  // Determinazione ruolo utente

        // Aggiungi l'utente con UID = ID del documento
        await this.firebaseService.addUserToFirestore(uid, nome, cognome, email, ruolo);
      })
    );
  }
}

