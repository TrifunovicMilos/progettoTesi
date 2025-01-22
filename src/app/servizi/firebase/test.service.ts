import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, onSnapshot, collection, addDoc, arrayRemove, deleteDoc, getDocs } from '@angular/fire/firestore';
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
      return 0;
    }
  }

  async removeTipoTest(tipoTestId: string, esameId: string): Promise<void> {
    const tipoTestDocRef = doc(this.firestore, 'tipiTest', tipoTestId);
    const esameDocRef = doc(this.firestore, 'esami', esameId);

    // Rimuove il tipoTest dalla collezione 'tipiTest'
    await deleteDoc(tipoTestDocRef);

    // Rimuove l'id del tipoTest dall'array "tipiTest" dell'esame
    await updateDoc(esameDocRef, {
      tipiTest: arrayRemove(tipoTestId),
    });
  }

  async createTest(tipoTestId: string): Promise<string> {
    const testColRef = collection(this.firestore, 'test');
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
  
    // 5. Restituisci l'ID del test creato
    return testDocRef.id;
  }

  private getRandomSubset(array: any[], size: number): any[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
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

  // aggiungo i campi rimanenti del test (es. voto) una volta che è stato completato
  async saveTest(uid: string, testId: string, risposte: any[], voto: number, data: string, studente: string): Promise<void> {
    try {
      const testDocRef = doc(this.firestore, 'test', testId);
      const studentiDocRef = doc(this.firestore, 'studenti', uid);

      // Aggiorna il documento del test aggiungendo il voto
      await updateDoc(testDocRef, { voto, risposte, data, studente });

      // Aggiorna l'array dei test dello studente
      const studenteSnap = await getDoc(studentiDocRef);
      if (studenteSnap.exists()) {
        const existingTests = studenteSnap.data()['test'] || [];
        await updateDoc(studentiDocRef, {
          test: [...existingTests, testDocRef.id],
        });
      } else {
        throw new Error('Studente non trovato.');
      }
    } catch (error) {
      console.error('Errore durante il salvataggio del test:', error);
      throw error;
    }
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

  async getAllTestsByEsame(esameId: string): Promise<any[]> {
    const esameDocRef = doc(this.firestore, 'esami', esameId);
    const esameDocSnap = await getDoc(esameDocRef);
  
    if (!esameDocSnap.exists()) {
      throw new Error('Esame non trovato.');
    }
  
    const esameData = esameDocSnap.data();
    const tipiTestIds = esameData['tipiTest'] || [];
  
    // Recupera tutti i test dalla collezione 'test'
    const testColRef = collection(this.firestore, 'test');
    const testSnapshots = await getDocs(testColRef);
  
    // Filtra i test in base ai tipiTest associati all'esame
    const filteredTests = testSnapshots.docs
      .map(docSnap => {
        const data = docSnap.data(); 
        data['id'] = docSnap.id;     
        return data;                
      })
      .filter(test => tipiTestIds.includes(test['tipoTest'])); 
  
    return filteredTests;
  }

}

