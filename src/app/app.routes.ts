import { Routes } from '@angular/router';
import { NotfoundComponent } from './componenti/notfound/notfound.component';
// import { authGuard, authGuardChild } from './auth/auth.guard';
import { RegistrazioneComponent } from './componenti/registrazione/registrazione.component';
import { LoginComponent } from './componenti/login/login.component';

export const routes: Routes = [
    {path: '', pathMatch:'full', redirectTo: 'signin' },
    {path: 'signup', component: RegistrazioneComponent},
    {path: 'signin', component: LoginComponent},
    {path: '404', component: NotfoundComponent },
    {path: '**', redirectTo: '404' },
];

