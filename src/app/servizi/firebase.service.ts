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
      const userDocRef = doc(this.firestore, 'users', uid); // Usa l'UID come ID del documento
      await setDoc(userDocRef, {
        nome: nome,
        cognome: cognome,
        email: email,
        ruolo: ruolo
      });
      console.log("Aggiunto ID = UID : " + uid + '\n' + "email: " + email + '\n' + 
      "nome: " + nome + '\n' + "cognome: " + cognome + '\n' + "ruolo: " + ruolo)
    } catch (error) {
      console.error("Errore nell'aggiunta utente", error)
    }
  }
}
