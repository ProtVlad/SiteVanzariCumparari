import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/products'; // URL-ul API-ului pentru gestionarea produselor

  constructor(private http: HttpClient) {}

  // Obține token-ul din sessionStorage
  private getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // Metodă pentru a obține lista de produse
  getProducts(): Observable<Product[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`
    });
    return this.http.get<Product[]>(this.apiUrl, { headers });
  }

  // Metodă pentru a adăuga un produs
  addProduct(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`
    });
    return this.http.post<Product>(this.apiUrl, formData, { headers });
  }

  // Metodă pentru a actualiza un produs
  updateProduct(productId: number, updatedProduct: Product, updatedFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', updatedProduct.name);
    formData.append('description', updatedProduct.description);
    formData.append('price', updatedProduct.price.toString());
    
    // Adăugăm fișierul dacă există
    if (updatedFile) {
      formData.append('file', updatedFile);
    }
  
    const token = sessionStorage.getItem('authToken'); // Token-ul JWT
  
    // Setăm antetul pentru autorizare
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    // Trimitem o cerere PUT pentru actualizarea produsului
    return this.http.put(`${this.apiUrl}/${productId}`, formData, { headers });
  }
  

  // Metoda pentru a șterge un produs
  deleteProduct(productId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`  // Adaugă token-ul în header
    });

    // Trimitem id-ul produsului în body
    return this.http.delete<any>(this.apiUrl, { 
      headers,
      body: { id: productId }  // Se trimite id-ul produsului în body-ul cererii DELETE
    });
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/user?id=${userId}`);
  }

  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`);
  }
  
}