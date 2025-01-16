import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

// protegge tutte le pagine figlie della Dashboard
// permette l'accesso solo se isLoggedIn = true, altrimenti rimanda alla pagina di login
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if(authService.isLoggedIn){
    return true
  }
  else{
    router.navigate(['/login'])
    return false
  }
};

export const esameGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const esameId = route.paramMap.get('idEsame');
  
  authService.getUserObservable().subscribe(userData => {
    if (userData) {
      const esamiUtente = userData.esami || '';
      // se non ho questo esame nella lista (di esami a cui sono iscritto o che gestisco) visualizzo un errore
      if (!esamiUtente.includes(esameId)) {
        router.navigate(['/exam-denied']);
        return false;
      }
    }
    return false;
  });
  return true; 
};

export const gestioneEsameGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const esameId = route.paramMap.get('idEsame') || '';
  
  authService.getUserObservable().subscribe(userData => {
    if (userData) {
      const esamiUtente = userData.esami || '';
      const ruolo = authService.getUserRole();
      // se non sono il docente di questo esame visualizzo un errore
      if (!(esamiUtente.includes(esameId) && ruolo === 'docente'))
        router.navigate(['exam-denied']);
        return false;
    }
    return false;
  });
  return true; 
};