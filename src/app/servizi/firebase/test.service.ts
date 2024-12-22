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
