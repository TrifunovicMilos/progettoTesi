import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// servizio a parte per la Sidebar in modo tale che più componentti possano essere notificato del suo stato 
export class SidebarService {

  private sidebarState = new BehaviorSubject<boolean>(false); // inizialmente chiusa (stretta)
  sidebarState$ = this.sidebarState.asObservable();

  // cambia stato sidebar ad ogni click sul menu
  toggleSidebar() {
    const currentState = this.sidebarState.value;
    this.sidebarState.next(!currentState); 
  }

  getSidebarState() {
    return this.sidebarState.value; // stato attuale
  }

  // chiamato dalle modifiche alla sidebar tramite mouse enter/leave, i quali NON chiamano toggleSidebar()
  setSidebarState(state: boolean) {
    this.sidebarState.next(state); 
  }
  
}
