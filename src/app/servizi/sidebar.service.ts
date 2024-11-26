import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private sidebarState = new BehaviorSubject<boolean>(false); // inizialmente chiusa (stretta)
  sidebarState$ = this.sidebarState.asObservable();

  toggleSidebar() {
    const currentState = this.sidebarState.value;
    this.sidebarState.next(!currentState); // cambia stato sidebar ad ogni click sul menu
  }

  getSidebarState() {
    return this.sidebarState.value; // stato attuale
  }

  setSidebarState(state: boolean) {
    this.sidebarState.next(state); // chiamato dalle modiche alla sidebar tramite mouse enter/leave
  }
  
}
