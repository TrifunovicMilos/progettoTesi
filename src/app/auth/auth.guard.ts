import { CanActivateChildFn, CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { TestComponent } from '../componenti/test/test.component';
import { FirebaseService } from '../servizi/firebase/firebase.service';

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
        router.navigate(['/access-denied']);
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
        router.navigate(['access-denied']);
        return false;
    }
    return false;
  });
  return true; 
};

export const testGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const firebaseService = inject(FirebaseService);
  const router = inject(Router);
  const testId = route.paramMap.get('idTest');

  const testData = await firebaseService.getTestService().getTestById(testId!);
  if (testData.voto == null) return true

  
  authService.getUserObservable().subscribe(userData => {
    if (userData) {
      const ruolo = authService.getUserRole();
      if(ruolo === 'docente')
      return true;

      const testStudente = userData.test || '';
      // se non sono lo studente associato al test visualizzo un errore
      if (!testStudente.includes(testId))
        router.navigate(['access-denied']);
        return false;
    }
    return false;
  });
  return true; 
};

export const CanDeactivateTestGuard: CanDeactivateFn<TestComponent> = (
  component: TestComponent
) => {
  if (!component.isCompleted && component.ruolo == "studente") {
    return confirm(
      'Sei sicuro di voler uscire? Le tue risposte non saranno salvate e il test non sarà conteggiato.'
    );
  }
  // Se il test è completato (sto guardando la revisione), non mostriamo il dialogo di conferma
  return true;
};