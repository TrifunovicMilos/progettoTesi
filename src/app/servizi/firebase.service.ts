import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc, getDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// servizio per aggiungere e manipolare i documenti in Firestore e per ascoltarne i cambiamenti
export class FirebaseService {

  private firestore: Firestore = inject(Firestore);
  constructor() { }

  // fuzione chiamata da signUp() in AuthService
  async addUserToFirestore(uid: string, nome: string, cognome: string, email: string, ruolo: string) {
    try {
      if(ruolo == "docente"){
        // collezione docenti
        const userDocRef = doc(this.firestore, 'docenti', uid); // Usa l'UID come ID del documento
        await setDoc(userDocRef, {
          nome: nome,
          cognome: cognome,
          email: email
      });
      }
      // collezione studenti
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

  // funzione chiamata da profiloComponent
  async getUserData(id: string, ruolo: string): Promise<any> {
    try {
      // percorso collezione -> documento (id)
      const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', id);
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
  
  // funzione chiamata da profiloComponent
  async updateUserAvatar(id: string, ruolo: string, avatar: string): Promise<void> {
    try {
      // percorso collezione -> documento (id)
      const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', id);
      await updateDoc(userDocRef, { avatar: avatar });
    } catch (error) {
      throw error; // lo stamperà ProfiloComponent
    }
  }
  
  // chiamato dall' header di DasboardComponent, per poter aggiornare istantaneamente l'Avatar quando viene cambiato in Profilo
  listenToUserData(id: string, ruolo: string) {
    // percorso collezione -> documento (id)
    const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', id);
    const userSubject = new BehaviorSubject<any>(null); 

    // ascolta i cambiamenti
    onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        userSubject.next(docSnap.data()); // Emmetti i dati aggiornati
      } else {
        console.log('Documento non trovato.');
        userSubject.next(null); // Se non esiste il documento, emetti null
      }
    });

    return userSubject.asObservable(); 
  }
}

