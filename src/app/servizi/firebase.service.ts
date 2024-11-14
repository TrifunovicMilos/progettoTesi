import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc } from '@angular/fire/firestore';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private firestore: Firestore = inject(Firestore);
  constructor() { }

  async addUserToFirestore(uid: string, nome: string, cognome: string, email: string, ruolo: string) {
    try {
      if(ruolo == "docente"){
        const userDocRef = doc(this.firestore, 'docenti', uid); // Usa l'UID come ID del documento
        await setDoc(userDocRef, {
          nome: nome,
          cognome: cognome,
          email: email
      });
      }
      else if(ruolo == "studente"){ 
        const userDocRef = doc(this.firestore, 'studenti', uid); // Usa l'UID come ID del documento
        await setDoc(userDocRef, {
          nome: nome,
          cognome: cognome,
          email: email
      });
      }
      console.log("Aggiunto ID = UID : " + uid + '\n' + "email: " + email + '\n' + 
      "nome: " + nome + '\n' + "cognome: " + cognome + '\n' + "ruolo: " + ruolo)
    } catch (error) {
      console.error("Errore nell'aggiunta utente", error)
    }
  }
}
