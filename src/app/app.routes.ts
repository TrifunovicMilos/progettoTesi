import { Routes } from '@angular/router';
import { NotfoundComponent } from './componenti/notfound/notfound.component';
import { LoginComponent } from './componenti/login/login.component';
import { DashboardComponent } from './componenti/dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';
import { Pagina1Component } from './componenti/pagina1/pagina1.component';
import { Pagina2Component } from './componenti/pagina2/pagina2.component';
import { Pagina3Component } from './componenti/pagina3/pagina3.component';
import { ProfiloComponent } from './componenti/profilo/profilo.component';

export const routes: Routes = [
    {path: '', component: DashboardComponent, canActivate: [authGuard], children: [
        {path:'', redirectTo: 'pagina1', pathMatch: 'full'},
        {path:'pagina1', component: Pagina1Component},
        {path:'pagina2', component: Pagina2Component},
        {path:'pagina3', component: Pagina3Component},
        {path:'profilo', component: ProfiloComponent},
    ]},
    {path: 'signin', component: LoginComponent},
    {path: '404', component: NotfoundComponent},
    {path: '**', redirectTo: '404' },
];

