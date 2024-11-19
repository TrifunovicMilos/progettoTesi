import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore';
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

  async getUserData(uid: string, ruolo: string): Promise<any> {
    try {
      const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        throw new Error('Documento non trovato.');
      }
    } catch (error) {
      console.error('Errore nel recupero dei dati utente:', error);
      throw error;
    }
  }

  async updateUserAvatar(uid: string, ruolo: string, avatar: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', uid);
      await updateDoc(userDocRef, { avatar: avatar });
    } catch (error) {
      throw error; // lo stamperà ProfiloComponent
    }
  }
}
