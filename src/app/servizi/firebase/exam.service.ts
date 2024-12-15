import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, collection, getDocs, addDoc,} from '@angular/fire/firestore';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExamService {

  private firestore: Firestore = inject(Firestore);
  constructor() {}

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
      console.error("Errore durante l'aggiunta dell'esame: ", error);
      throw new Error("Errore nell'aggiunta dell'esame");
    }
  }

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

  // chiamata da HomeComponent nel caso il ruolo sia studente, per mostrare tutti gli esami disponibili
  async getEsami(): Promise<any[]> {
    const esamiColRef = collection(this.firestore, 'esami'); // collezione 'esami'
    const esamiSnapshot = await getDocs(esamiColRef); // ottieni tutti i documenti (esami)
    return esamiSnapshot.docs.map((doc) => {
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

  // Metodo per creare un pool di domande e associarlo all'esame
  async createDomandePool(esameId: string, domandeIds: string[]): Promise<void> {
    const esamiColRef = collection(this.firestore, 'esami');
    const poolColRef = collection(this.firestore, 'pool');

    try {
      // 1. Creiamo un nuovo documento nella collezione "pool" con gli ID delle domande
      const poolDocRef = await addDoc(poolColRef, {domande: domandeIds});

      console.log('Pool creato con ID:', poolDocRef.id);

      // 2. Aggiungiamo l'ID del pool al documento dell'esame
      const esameDocRef = doc(this.firestore, 'esami', esameId);
      const esameDocSnap = await getDoc(esameDocRef);

      if (esameDocSnap.exists()) {
        const existingPools = esameDocSnap.data()['pool'] || [];
        await updateDoc(esameDocRef, {
          pool: [...existingPools, poolDocRef.id], // Aggiungiamo l'ID del nuovo pool
        });

        console.log(`Pool ${poolDocRef.id} aggiunto all'esame ${esameId}`);
      } else {
        throw new Error('Esame non trovato.');
      }

    } catch (error) {
      console.error("Errore durante la creazione del pool:", error);
      throw new Error("Errore nella creazione del pool.");
    }
  }
}
