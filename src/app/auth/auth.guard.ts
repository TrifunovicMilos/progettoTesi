import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

// protegge tutte le pagine tranne quella di login (e 404notFound)
// permette di accederci solo se isLoggedIn = true, altrimenti rimanda alla pagina di login
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if(authService.isLoggedIn){
    return true
  }
  else{
    router.navigate(['/signin'])
    return false
  }
};

// export const authGuardChild: CanActivateChildFn = (route, state) => {
//   const authService = inject(AuthService); 
//   return authService.isAdmin; 
// };