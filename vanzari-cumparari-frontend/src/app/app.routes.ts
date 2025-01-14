import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ErrorComponent } from './error/error.component';

export const routes: Routes = [
  // Ruta pentru pagina de login
  { path: 'login', component: LoginComponent },

  // Ruta pentru dashboard
  { path: 'dashboard', component: DashboardComponent },

  // Ruta pentru eroare (404)
  { path: 'error', component: ErrorComponent },

  // Ruta default (redirecționare către login)
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Ruta wildcard pentru orice alt URL care nu există
  { path: '**', component: ErrorComponent }
];