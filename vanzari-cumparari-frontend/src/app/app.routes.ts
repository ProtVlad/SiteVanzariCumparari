import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ErrorComponent } from './error/error.component';
import { ProfileComponent } from './profile/profile.component';
import { SearchUsersComponent } from './search-users/search-users.component';

export const routes: Routes = [
  // Ruta pentru pagina de login
  { path: 'home', component: HomeComponent },

  // Ruta pentru dashboard
  { path: 'dashboard', component: DashboardComponent },

  { path: 'profile', component: ProfileComponent },

  { path: 'search-users', component: SearchUsersComponent },

  // Ruta pentru eroare (404)
  { path: 'error', component: ErrorComponent },

  // Ruta default (redirecționare către home)
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Ruta wildcard pentru orice alt URL care nu există
  { path: '**', component: ErrorComponent }
];