import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc, getDoc, updateDoc, onSnapshot, collection, getDocs, addDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore: Firestore = inject(Firestore);
  constructor() {}

  // fuzione chiamata da signUp() in AuthService, chiamata a sua volta dal click su "registrati" in LoginComponent
  async addUserToFirestore(uid: string, nome: string, cognome: string, email: string, ruolo: string) {
    // in base al ruolo determino la collezione (docenti o studenti) nella quale viene aggiunto l'utente
    // di default, l'ID del documento creato è casuale. Impongo IDdocumento (firestore) = UIDutente (firebase auth)
    const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', uid);
    await setDoc(userDocRef, {
      nome: nome,
      cognome: cognome,
      email: email,
      esami: []
    });
  }

  // chiamata da authService.loadUserData()
  async getUserData(id: string, ruolo: string): Promise<any> {
    // percorso collezione -> documento (id)
    const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', id);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('Documento non trovato.');
    }
  }

  // funzione chiamata da profiloComponent per cambiare Avatar (field = avatar)
  async updateUserField(id: string, ruolo: string, field: string, value: any): Promise<void> {
    // percorso collezione -> documento (id)
    const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', id);
    await updateDoc(userDocRef, { [field]: value });
  }

  // chiamato da DasboardComponent, per aggiornare istantaneamente l'Avatar nell'header, quando esso viene cambiato in Profilo
  listenToUserData(id: string, ruolo: string) {
    // percorso collezione -> documento (id)
    const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', id);
    const userSubject = new BehaviorSubject<any>(null);

    // ascolta i cambiamenti
    onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        userSubject.next(docSnap.data()); // Emmetti i dati aggiornati
      } else {
        userSubject.next(null); // Se non esiste il documento, emetti null
      }
    });

    return userSubject.asObservable();
  }
}
