import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, onSnapshot, collection, addDoc, arrayRemove, deleteDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  private firestore: Firestore = inject(Firestore);
  constructor() { }

  async createTipoTest(nomeTest: string, descrizione: string, poolId: string, numeroDomande: number, esameId: string): Promise<any> {
    const esamiColRef = collection(this.firestore, 'esami');
    const tipiTestColRef = collection(this.firestore, 'tipiTest');

    // 1. Creazione nuovo documento nella collezione "tipiTest" 
    const tipoTestDocRef = await addDoc(tipiTestColRef, {
      nomeTest: nomeTest,
      descrizione: descrizione,
      pool: poolId,
      numeroDomande: numeroDomande,
    });
    
    // 2. Aggiunta dell'ID del tipoTest al documento dell'esame
    const esameDocRef = doc(this.firestore, 'esami', esameId);
    const esameDocSnap = await getDoc(esameDocRef);

    if (esameDocSnap.exists()) {
      const existingPools = esameDocSnap.data()['tipiTest'] || [];
      await updateDoc(esameDocRef, {
        tipiTest: [...existingPools, tipoTestDocRef.id],
      });

      // console.log(`Pool ${poolDocRef.id} aggiunto all'esame ${esameId}`);
    } else {
      throw new Error('Esame non trovato.');
    }

  }

  async getTipoTestById(id: string): Promise<any> {
    const tipoTestDocRef = doc(this.firestore, 'tipiTest', id);
    const docSnap = await getDoc(tipoTestDocRef);

    if (docSnap.exists()) {
      return { id, ...docSnap.data() };
    } else {
      throw new Error('TipoTest non trovata.');
    }
  }




}
