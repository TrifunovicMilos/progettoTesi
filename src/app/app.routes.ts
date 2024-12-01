import { Routes } from '@angular/router';
import { NotfoundComponent } from './componenti/notfound/notfound.component';
import { LoginComponent } from './componenti/login/login.component';
import { DashboardComponent } from './componenti/dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';
import { HomeComponent } from './componenti/home/home.component';
import { Pagina2Component } from './componenti/pagina2/pagina2.component';
import { Pagina3Component } from './componenti/pagina3/pagina3.component';
import { ProfiloComponent } from './componenti/profilo/profilo.component';
import { Pagina4Component } from './componenti/pagina4/pagina4.component';
import { EsameComponent } from './componenti/esame/esame.component';

export const routes: Routes = [
    // a questo gruppo di pagina ci si puo accedere solo se loggati
    // Dashboard contiene Header (in alto) e Sidebar (a sinistra) fissi 
    // e, a destra, una delle pagine sottostanti (<routeroutlet> in dashboard.component.ts)
    {path: '', component: DashboardComponent, canActivate: [authGuard], children: [
        {path:'', redirectTo: 'home', pathMatch: 'full'},
        {path:'home', component: HomeComponent},
        // { path: 'esame/:id', component: EsameComponent },
        {path:'pagina2', component: Pagina2Component},
        {path:'pagina3', component: Pagina3Component},
        {path:'pagina4', component: Pagina4Component},
        {path:'profilo', component: ProfiloComponent},
    ]},
    {path: 'signin', component: LoginComponent},
    {path: '404', component: NotfoundComponent},
    {path: '**', redirectTo: '404' },
];

