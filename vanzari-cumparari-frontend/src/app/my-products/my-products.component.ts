import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '../services/product-services/product.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user-services/user.service';


@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.css'
})
export class MyProductsComponent {
  searchQuery: string = '';
  products: Product[] = []; // Toate produsele
  loggedUserId: string | null = null; // ID-ul utilizatorului logat

  constructor(private http: HttpClient, private productService: ProductService, private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.loggedUserId = this.userService.getLoggedUserId();
    this.loadProducts(); // Încarcă utilizatorii
  }

  // Funcția care încarcă toate produsele
  loadProducts(): void {
    this.http.get<any>('http://localhost:3000/products').subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.products.filter(
            (product: { user_id: string; }) => product.user_id === this.loggedUserId
          );
        } else {
          console.error('Failed to load users, success flag is false.');
        }
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  deleteProduct(productId: number): void {
    this.productService.deleteProduct(productId).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Ștergem produsul din lista locală după succes
          this.products = this.products.filter(product => product.id !== productId);
        } else {
          console.error('Eroare la ștergerea produsului:', response.message);
        }
      },
      error: (err: any) => {
        console.error('Eroare la cererea DELETE:', err);
      }
    });
  }

  goToEditProduct(productId: number) {
    this.router.navigate(['/edit-product', productId]);
  }

  goToProductDetails(productId: number): void {
    this.router.navigate([`/product/${productId}`]);
  }
}
