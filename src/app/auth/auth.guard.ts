import { CanActivateChildFn, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService); // Iniezione del servizio
//   return authService.isAuthenticated(); 
// };

// export const authGuardChild: CanActivateChildFn = (route, state) => {
//   const authService = inject(AuthService); // Iniezione del servizio
//   return authService.isRoleAdmin(); 
// };