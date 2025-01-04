import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// servizio a parte per la Sidebar in modo tale che più componentti possano essere notificati del suo stato 
export class SidebarService {

  private sidebarState = new BehaviorSubject<boolean>(false); // inizialmente chiusa (stretta)
  sidebarState$ = this.sidebarState.asObservable();

  // cambia stato sidebar ad ogni click sul menu
  // chiamta da togglesidebar() di dashboard.component.ts
  toggleSidebar() {
    const currentState = this.sidebarState.value;
    this.sidebarState.next(!currentState); 
  }

  // chiamato dalle modifiche alla sidebar tramite mouse enter/leave, i quali NON chiamano toggleSidebar()
  // chiamata da onMouseEnter() e onMouseLeave di dashboard.component.ts
  setSidebarState(state: boolean) {
    this.sidebarState.next(state); 
  }
  
}
