import { Routes } from '@angular/router';
import { NotfoundComponent } from './componenti/notfound/notfound.component';
import { LoginComponent } from './componenti/login/login.component';
import { DashboardComponent } from './componenti/dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';
import { HomeComponent } from './componenti/home/home.component';
import { Pagina3Component } from './componenti/pagina3/pagina3.component';
import { ProfiloComponent } from './componenti/profilo/profilo.component';
import { Pagina4Component } from './componenti/pagina4/pagina4.component';
import { EsameComponent } from './componenti/gestione_esame/esame/esame.component';
import { IMieiEsamiComponent } from './componenti/i-miei-esami/i-miei-esami.component';
import { EsameNegatoComponent } from './componenti/gestione_esame/esame-negato/esame-negato.component';
import { DomandeComponent } from './componenti/gestione_esame/domande/domande.component';
import { PoolComponent } from './componenti/gestione_esame/pool/pool.component';

export const routes: Routes = [
    // Per accedere a questo gruppo di pagine è necessario essere loggati
    // Dashboard contiene Header (in alto) e Sidebar (a sinistra) fissi 
    // e, a destra, una delle pagine sottostanti (<routeroutlet> in dashboard.component.ts)
    {path: '', component: DashboardComponent, canActivate: [authGuard], children: [
        {path: '', redirectTo: 'home', pathMatch: 'full'},
        {path: 'home', component: HomeComponent},
        {path: 'esami/:id', component: EsameComponent },
        {path: 'esami/:idEsame/domande', component: DomandeComponent},
        {path: 'esami/:idEsame/pool/:idPool', component: PoolComponent},
        {path: 'my-exams', component: IMieiEsamiComponent},
        {path: 'pagina3', component: Pagina3Component},
        {path: 'pagina4', component: Pagina4Component},
        {path: 'profilo', component: ProfiloComponent},
    ]},
    {path: 'login', component: LoginComponent},
    {path: '404', component: NotfoundComponent},
    {path:'exam-denied', component: EsameNegatoComponent},
    {path: '**', redirectTo: '404' },
];

