import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private sidebarState = new BehaviorSubject<boolean>(false); // Stato iniziale aperto
  sidebarState$ = this.sidebarState.asObservable();

  toggleSidebar() {
    const currentState = this.sidebarState.value;
    this.sidebarState.next(!currentState); // Cambia lo stato
  }

  getSidebarState() {
    return this.sidebarState.value; // Stato attuale
  }

  setSidebarState(state: boolean) {
    this.sidebarState.next(state);
  }
  
}
