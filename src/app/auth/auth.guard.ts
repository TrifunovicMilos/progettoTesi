import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Iniezione del servizio
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
//   const authService = inject(AuthService); // Iniezione del servizio
//   return authService.isAdmin; 
// };