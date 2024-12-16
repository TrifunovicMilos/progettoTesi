import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, onSnapshot, collection, addDoc, arrayRemove, deleteDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { BehaviorSubject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private firestore: Firestore = inject(Firestore);
  constructor() { }

  async addDomanda(testo: string, opzioni: string[], opzioneCorretta: string): Promise<any> {
    const domandeColRef = collection(this.firestore, 'domande');

    const docRef = await addDoc(domandeColRef, {
      testo: testo,
      opzioni: opzioni,
      opzioneCorretta: opzioneCorretta,
    });
    console.log('Domanda aggiunta con ID: ', docRef.id);
    return docRef;
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

  async removeDomande(domandeId: string[], esameId: string): Promise<void> {
    const esameDocRef = doc(this.firestore, 'esami', esameId);

    // Rimuovere le domande dall'elenco associato all'esame
    await updateDoc(esameDocRef, {
      domande: arrayRemove(...domandeId),
    });

    // Rimuovere i documenti delle domande dalla collezione "domande"
    for (const domandaId of domandeId) {
      const domandaDocRef = doc(this.firestore, 'domande', domandaId);
      await deleteDoc(domandaDocRef);
    }
  }

  async getDomandaById(id: string): Promise<any> {
    const domandaDocRef = doc(this.firestore, 'domande', id);
    const docSnap = await getDoc(domandaDocRef);

    if (docSnap.exists()) {
      return { id, ...docSnap.data() };
    } else {
      throw new Error('Domanda non trovata.');
    }
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
