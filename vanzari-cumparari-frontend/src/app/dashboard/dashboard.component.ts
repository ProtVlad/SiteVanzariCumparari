import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card'; // Pentru carduri Angular Material
import { MatButtonModule } from '@angular/material/button'; // Pentru butoane
import { MatInputModule } from '@angular/material/input'; // Pentru câmpul de căutare
import { MatFormFieldModule } from '@angular/material/form-field'; // Pentru form field
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    searchQuery: string = '';
    products: any[] = []; // Toate produsele
    filteredProducts: any[] = []; // Utilizatori excluzând pe cel logat
    loggedUserId: string = ''; // ID-ul utilizatorului logat
  
    constructor(private http: HttpClient, private router: Router) {}

    goToProductDetails(productId: number): void {
      // Redirecționează către /product-details/:id, unde :id este ID-ul produsului
      this.router.navigate([`/product/${productId}`]);
    }

    goToProfile(userId: string): void {
      // Navighează către profilul utilizatorului pe baza user_id
      this.router.navigate(['/profile', userId]);
    }
  
    ngOnInit(): void {
      this.loadLoggedUser(); // Încarcă detaliile utilizatorului logat
      this.loadProducts(); // Încarcă utilizatorii
    }
  
    // Funcția care încarcă utilizatorul logat din sessionStorage
    loadLoggedUser(): void {
      const loggedUserData = sessionStorage.getItem('loggedInUser');
      if (loggedUserData) {
        const loggedUser = JSON.parse(loggedUserData);
        this.loggedUserId = loggedUser.id; // Salvează ID-ul utilizatorului logat
      }
    }
  
    // Funcția care încarcă toate produsele
    loadProducts(): void {
      this.http.get<any>('http://localhost:3000/products').subscribe({
        next: (response) => {
          if (response.success) {
            this.products = response.products.filter(
              (product: { user_id: string; }) => product.user_id !== this.loggedUserId
            );
            this.filteredProducts = this.products; // Inițializăm lista filtrată
          } else {
            console.error('Failed to load products, success flag is false.');
          }
        },
        error: (err) => {
          console.error('Error loading products:', err);
        }
      });
    }
    
    onSearch(): void {
      if (this.searchQuery.trim() === '') {
        this.filteredProducts = this.products;  // Dacă nu există text, afișăm toți utilizatorii
      } else {
        this.filteredProducts = this.products.filter(product =>
          product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    }
}
