import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc, getDoc, updateDoc, onSnapshot, collection, getDocs, addDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// servizio per aggiungere e manipolare i documenti in Firestore e per ascoltarne i cambiamenti
export class FirebaseService {

  private firestore: Firestore = inject(Firestore);
  constructor() { }

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

  async addEsame(titolo: string, docente: string, descrizione: string, imgUrl:string, 
    annoAccademico: string, crediti: number, lingua: string): Promise<any> {
    
    const esamiColRef = collection(this.firestore, 'esami');
    
    try {
      const docRef = await addDoc(esamiColRef, {
        titolo: titolo,
        docente: docente,
        descrizione: descrizione,
        imgUrl: imgUrl,
        annoAccademico: annoAccademico,
        crediti: crediti,
        lingua: lingua,
      });
      console.log('Esame aggiunto con ID: ', docRef.id);
      return docRef;
    } catch (error) {
      console.error('Errore durante l\'aggiunta dell\'esame: ', error);
      throw new Error('Errore nell\'aggiunta dell\'esame');
    }
  }

  async addEsameToUser(id: string, ruolo: string, esameId: string): Promise<void> {
    const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', id);
    const docSnap = await getDoc(userDocRef);
  
    if (docSnap.exists()) {
      const existingEsami = docSnap.data()['esami'] || [];

      await updateDoc(userDocRef, {
        esami: [...existingEsami, esameId]  
      });
    } else {
      throw new Error('Docente non trovato');
    }
  }
  
  // chiamata da HomeComponent nel caso il ruolo sia studente, per mostrare tutti gli esami disponibili
  async getEsami(): Promise<any[]> {
    const esamiColRef = collection(this.firestore, 'esami'); // collezione 'esami'
    const esamiSnapshot = await getDocs(esamiColRef); // ottieni tutti i documenti (esami)
    return esamiSnapshot.docs.map(doc => {
      // l'ID serve a HomeComponent per quando clicco su esame, per reindirizzarmi a /esami/id
      return { id: doc.id, ...doc.data() }; // Restituisce i dati dei documenti, incluso l'ID
    });
  }
  
  // servirà per quando entro in un esame specifico, avrò probabilmente un EsameComponent dove potrò vedere i test relativi
  // l'esame avrà root /esami/id
  async getEsameById(id: string): Promise<any> {
    const esameDocRef = doc(this.firestore, 'esami', id);
    const docSnap = await getDoc(esameDocRef);

    if (docSnap.exists()) {
      return { id, ...docSnap.data() };
    } else {
      throw new Error('Esame non trovato.');
    }
  }

  async addDomanda(testo: string, opzioni: string[], opzioneCorretta: string): Promise<any> {
    const domandeColRef = collection(this.firestore, 'domande'); 
  
    try {
      const docRef = await addDoc(domandeColRef, {
        testo: testo,
        opzioni: opzioni,
        opzioneCorretta: opzioneCorretta
      });
      console.log('Domanda aggiunta con ID: ', docRef.id);
      return docRef;
    } catch (error) {
      console.error('Errore durante l\'aggiunta dell\'esame: ', error);
      throw new Error('Errore nell\'aggiunta dell\'esame');
    }
  }

  async addDomandaToEsame(domandaId: string, esameId: string): Promise<void> {
    const esameDocRef = doc(this.firestore, 'esami', esameId);
    const docSnap = await getDoc(esameDocRef);
  
    if (docSnap.exists()) {
      const existingDomande = docSnap.data()['domande'] || [];
      await updateDoc(esameDocRef, {
        domande: [...existingDomande, domandaId]  
      });
    } else {
      throw new Error('Esame non trovato');
    }
  }

  async getDomandaById(id: string): Promise<any> {
    const domandaDocRef = doc(this.firestore, 'domande', id);
    const docSnap = await getDoc(domandaDocRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('Domanda non trovata.');
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

  // Ascolta le modifiche in tempo reale alle domande di un esame
  listenToDomandeInEsame(esameId: string) {
    // Riferimento al documento specifico dell'esame
    const esameDocRef = doc(this.firestore, 'esami', esameId);
    const domandeSubject = new BehaviorSubject<string[]>([]); // Comincia con un array vuoto di domande
  
    // Ascolta i cambiamenti nel documento dell'esame
    onSnapshot(esameDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data['domande'])) {
          // Se il campo 'domande' esiste ed è un array, emetti le domande aggiornate
          domandeSubject.next(data['domande']);
        } else {
          domandeSubject.next([]); // Emetti un array vuoto se non ci sono domande
        }
      } else {
        console.log('Documento non trovato.');
        domandeSubject.next([]); // Emetti un array vuoto se il documento non esiste
      }
    });
  
    // Restituisci l'osservabile
    return domandeSubject.asObservable();
  }
}

