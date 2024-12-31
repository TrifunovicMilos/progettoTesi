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

  async getTestById(id: string): Promise<any> {
    const testDocRef = doc(this.firestore, 'test', id);
    const docSnap = await getDoc(testDocRef);

    if (docSnap.exists()) {
      return { id, ...docSnap.data() };
    } else {
      throw new Error('Test non trovato.');
    }
  }

  async getStudentTests(uid: string): Promise<any[]> {
    const studentiDocRef = doc(this.firestore, 'studenti', uid);
    const studenteSnap = await getDoc(studentiDocRef);
  
    if (studenteSnap.exists()) {
      const studentData = studenteSnap.data();
      const testIds = studentData['test'] || [];
        
      const testPromises = testIds.map((testId: string) => this.getTestById(testId));
      return Promise.all(testPromises);
    } else {
      throw new Error('Studente non trovato.');
    }
  }

  async removeTipoTest(tipoTestId: string, esameId: string): Promise<void> {
    const tipoTestDocRef = doc(this.firestore, 'tipiTest', tipoTestId);
    const esameDocRef = doc(this.firestore, 'esami', esameId);

    // Rimuove il pool dalla collezione 'pool'
    await deleteDoc(tipoTestDocRef);

    // Rimuove l'id del pool dall'array "pool" dell'esame
    await updateDoc(esameDocRef, {
      tipiTest: arrayRemove(tipoTestId),
    });
  }

  async createTest(uid: string, tipoTestId: string): Promise<string> {
    const testColRef = collection(this.firestore, 'test');
    const studentiDocRef = doc(this.firestore, 'studenti', uid);
    const tipoTestDocRef = doc(this.firestore, 'tipiTest', tipoTestId);
  
    // 1. Ottieni il documento del tipo test
    const tipoTestSnap = await getDoc(tipoTestDocRef);
    if (!tipoTestSnap.exists()) {
      throw new Error('TipoTest non trovato.');
    }
    const tipoTestData = tipoTestSnap.data();
  
    // 2. Estrai informazioni dal tipo test
    const numeroDomande = tipoTestData['numeroDomande'];
    const poolId = tipoTestData['pool'];
    
    // 3. Ottieni le domande dal pool
    const poolDocRef = doc(this.firestore, 'pool', poolId);
    const poolSnap = await getDoc(poolDocRef);
    if (!poolSnap.exists()) {
      throw new Error('Pool non trovato.');
    }
    const poolData = poolSnap.data();
    const domande = poolData['domande'] || [];
      
    // Seleziona casualmente N domande dal pool
    const domandeSelezionate = this.getRandomSubset(domande, numeroDomande);
  
    // 4. Crea il documento del test
    const testDocRef = await addDoc(testColRef, {
      tipoTest: tipoTestId,
      domande: domandeSelezionate,
    });
  
    // 5. Aggiorna l'array dei test dello studente
    const studenteSnap = await getDoc(studentiDocRef);
    if (studenteSnap.exists()) {
      const existingTests = studenteSnap.data()['test'] || [];
      await updateDoc(studentiDocRef, {
        test: [...existingTests, testDocRef.id],
      });
    } else {
      throw new Error('Studente non trovato.');
    }
  
    // 6. Restituisci l'ID del test creato
    return testDocRef.id;
  }

  async saveTest(testId: string, voto: number, data: any): Promise<void> {
    try {
      const testDocRef = doc(this.firestore, 'test', testId);
  
      // Aggiorna il documento del test aggiungendo il voto
      await updateDoc(testDocRef, { voto, data: data });
    } catch (error) {
      console.error('Errore durante il salvataggio del test:', error);
      throw error;
    }
  }
  
  
  // Metodo ausiliario per selezionare un sottoinsieme casuale
  private getRandomSubset(array: any[], size: number): any[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }
  

  listenToTestInEsame(esameId: string) {
    const esameDocRef = doc(this.firestore, 'esami', esameId);
    const tipiTestSubject = new BehaviorSubject<string[]>([]);

    onSnapshot(esameDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data['tipiTest'])) {
          tipiTestSubject.next(data['tipiTest']);
        } else {
          tipiTestSubject.next([]);
        }
      } else {
        console.log('Documento non trovato.');
        tipiTestSubject.next([]);
      }
    });

    return tipiTestSubject.asObservable();
  }
}

