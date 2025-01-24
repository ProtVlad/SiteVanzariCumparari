import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.css'
})
export class ListingComponent {
  products: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  goToProductDetails(productId: number): void {
    // Redirecționează către /product-details/:id, unde :id este ID-ul produsului
    this.router.navigate([`/product/${productId}`]);
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    this.http.get<any>('http://localhost:3000/products').subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.products.filter(
            (product: { user_id: string; }) => product.user_id == userId
          );
        } else {
          console.error('Failed to load products, success flag is false.');
        }
      },
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });
  }
}
