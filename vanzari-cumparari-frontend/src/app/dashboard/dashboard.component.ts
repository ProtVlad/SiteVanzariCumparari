import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card'; // Pentru carduri Angular Material
import { MatButtonModule } from '@angular/material/button'; // Pentru butoane
import { MatInputModule } from '@angular/material/input'; // Pentru câmpul de căutare
import { MatFormFieldModule } from '@angular/material/form-field'; // Pentru form field
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../models/product.model';
import { UserService } from '../services/user-services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    searchQuery: string = '';
    selectedTag: string = '';
    products: Product[] = []; // Toate produsele
    filteredProducts: any[] = []; // Utilizatori excluzând pe cel logat
    loggedUserId: string | null = null; // ID-ul utilizatorului logat
    tags: string[] = [];
  
    constructor(private http: HttpClient, private router: Router, private userService: UserService) {}

    goToProductDetails(productId: number): void {
      // Redirecționează către /product-details/:id, unde :id este ID-ul produsului
      this.router.navigate([`/product/${productId}`]);
    }

    goToProfile(userId: string): void {
      // Navighează către profilul utilizatorului pe baza user_id
      this.router.navigate(['/profile', userId]);
    }
  
    ngOnInit(): void {
      this.loggedUserId = this.userService.getLoggedUserId();
      this.loadProducts(); // Încarcă utilizatorii
      this.fetchTags();
    }

    fetchTags() {
      this.http.get<{ success: boolean; tags: string[] }>('http://localhost:3000/tags')
        .subscribe(response => {
          if (response.success) {
            this.tags = response.tags; // Populăm lista de tag-uri
          }
        });
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
      // Filtrăm produsele pe baza căutării și a tag-ului
      this.filteredProducts = this.products.filter(product => {
        // Filtrarea pe baza numelui produsului
        const matchesSearch = product.name.toLowerCase().includes(this.searchQuery.toLowerCase());

        // Filtrarea pe baza tag-ului
        const matchesTag = this.selectedTag ? product.tag.includes(this.selectedTag) : true;

        // Returnează produsul doar dacă ambele condiții sunt adevărate
        return matchesSearch && matchesTag;
      });
    }
}
