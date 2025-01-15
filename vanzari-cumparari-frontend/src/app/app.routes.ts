import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ErrorComponent } from './error/error.component';
import { ProfileComponent } from './profile/profile.component';
import { SearchUsersComponent } from './search-users/search-users.component';
import { AddProductComponent } from './add-product/add-product.component';
import { MyProductsComponent } from './my-products/my-products.component';
import { ListingComponent } from './listing/listing.component';
import { ProductDetailsComponent } from './product-details/product-details.component';

export const routes: Routes = [
  // Ruta pentru pagina de login
  { path: 'home', component: HomeComponent },

  // Ruta pentru dashboard
  { path: 'dashboard', component: DashboardComponent },

  { path: 'profile/:userId', component: ProfileComponent },

  { path: 'search-users', component: SearchUsersComponent },

  { path: 'add-product', component: AddProductComponent },

  { path: 'edit-product/:id', component: AddProductComponent },

  { path: 'listing/:userId', component: ListingComponent },

  { path: 'my-products', component: MyProductsComponent },

  { path: 'product/:productId', component: ProductDetailsComponent },
  // Ruta pentru eroare (404)
  { path: 'error', component: ErrorComponent },

  // Ruta default (redirecționare către home)
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Ruta wildcard pentru orice alt URL care nu există
  { path: '**', component: ErrorComponent }
];