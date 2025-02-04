import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, collection, getDocs, addDoc, arrayRemove,} from '@angular/fire/firestore';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExamService {

  private firestore: Firestore = inject(Firestore);
  constructor() {}

  // creazione nuovo esame da parte del docente
  async addEsame(titolo: string, docente: string, descrizione: string, imgUrl: string, 
    annoAccademico: string, crediti: number, lingua: string): Promise<any> {

    const esamiColRef = collection(this.firestore, 'esami');

    const docRef = await addDoc(esamiColRef, {
      titolo: titolo,
      docente: docente,
      descrizione: descrizione,
      imgUrl: imgUrl,
      annoAccademico: annoAccademico,
      crediti: crediti,
      lingua: lingua,
    });
    return docRef;
  }
  
  // associazione dell'esame al docente che lo ha creato oppure iscrizione studente all'esame
  // in ogni caso, aggiunta dell'id dell'esame all'array esami[] dell'utente
  async addEsameToUser(id: string, ruolo: string, esameId: string): Promise<void> {
    const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', id);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const existingEsami = docSnap.data()['esami'] || [];

      await updateDoc(userDocRef, {
        esami: [...existingEsami, esameId],
      });
    } else {
      throw new Error('Docente non trovato');
    }
  }
  
  // disiscrizione dello studente dall'esame
  // *** potrà essere usata in futuro anche per i docenti che eliminano l'esame
  async removeEsameFromUser(id: string, ruolo: string, esameId: string): Promise<void> {
    const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', id);
    
    await updateDoc(userDocRef, {
      esami: arrayRemove(esameId),
    });
  }

  // chiamata da HomeComponent nel caso il ruolo sia studente, per mostrare tutti gli esami disponibili
  async getEsami(): Promise<any[]> {
    const esamiColRef = collection(this.firestore, 'esami'); // collezione 'esami'
    const esamiSnapshot = await getDocs(esamiColRef); // ottieni tutti i documenti (esami)
    return esamiSnapshot.docs.map((doc) => {
      // l'ID serve a HomeComponent per quando clicco su esame, per reindirizzarmi a /esami/id
      return { id: doc.id, ...doc.data() }; // Restituisce i dati dei documenti, incluso l'ID
    });
  }
  
  // info sull'esame dato idEsame
  async getEsameById(id: string): Promise<any> {
    const esameDocRef = doc(this.firestore, 'esami', id);
    const docSnap = await getDoc(esameDocRef);

    if (docSnap.exists()) {
      return { id, ...docSnap.data() };
    } else {
      throw new Error('Esame non trovato.');
    }
  }
  
  // tutti gli esami dell'utente, non solo gli idEsame ma anche tutte le altre informazioni
  async getUserEsami(id: string, ruolo: string): Promise<any[]> {
    const userDocRef = doc(this.firestore, ruolo === 'docente' ? 'docenti' : 'studenti', id);
    const userSnap = await getDoc(userDocRef);
  
    if (userSnap.exists()) {
      const userData = userSnap.data();
      // il documento dell'utente contiene solo i riferimenti all'esame
      const esamiIds = userData['esami'] || [];
        
      const esamiPromises = esamiIds.map((esameId: string) => this.getEsameById(esameId));
      return Promise.all(esamiPromises);
    } else {
      throw new Error('Utente non trovato.');
    }
  }

}
