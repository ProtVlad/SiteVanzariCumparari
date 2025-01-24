import { Component } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product-services/product.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
  providers: [ProductService]
})
export class AddProductComponent {
  product: Product = new Product(0, '', '', '', 0, 0, ''); // Inițializare cu valori implicite
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileError: string = '';
  isEditMode: boolean = false; // Dacă e fals, componenta e în modul de "adăugare"
  productId: number | null = null; // ID-ul produsului pentru editare

  constructor(private productService: ProductService, private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = parseInt(id, 10);
      this.loadProductForEdit(this.productId);
    }
  }

  loadProductForEdit(productId: number): void {
    this.productService.getProductById(productId).subscribe({
      next: (response: any) => {
        this.product = response.product;
        console.log(this.product);
        //this.previewUrl = this.product.image; // Dacă ai un URL pentru imagine
      },
      error: (err) => console.error('Eroare la încărcarea produsului:', err),
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const validFileTypes = ['image/jpeg', 'image/png', 'image/bmp']; // Tipuri de fișiere acceptate
      if (!validFileTypes.includes(file.type)) {
        this.fileError = 'Tipul fișierului nu este valid. Alegeți un fișier .jpg, .png sau .bmp.'; // Afișăm eroare
        this.selectedFile = null; // Resetează fișierul selectat
      } else {
        // Creare preview pentru imagine
        this.fileError = '';
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrl = reader.result as string; // Salvăm URL-ul generat
        };
        reader.readAsDataURL(file);
      }
    }
  }

  isFormValid(): boolean {
    // Validare câmpuri
    return (
      this.product.name?.trim() !== '' &&
      this.product.description?.trim() !== '' &&
      this.product.tag?.trim() !== '' &&
      this.product.price > 0 &&
      this.selectedFile !== null &&
      this.fileError === ''
    );
  }

  onSubmit() {
    if (!this.selectedFile) {
      console.error('Niciun fișier selectat!');
      return;
    }
    const userId = JSON.parse(sessionStorage.getItem('loggedInUser') || '{}').id;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('name', this.product.name);
    formData.append('description', this.product.description);
    formData.append('price', this.product.price.toString());
    formData.append('user_id', userId);
    formData.append('tag', this.product.tag)
  
    if (this.isEditMode && this.productId) {
      // În loc să trimiți formData, trimitem cei trei parametri
      this.productService.updateProduct(this.productId, this.product, this.selectedFile).subscribe({
        next: (response) => {
          console.log('Produsul a fost actualizat cu succes:', response);
          window.location.href = '/dashboard';
        },
        error: (error) => {
          console.error('Eroare la actualizarea produsului:', error);
        },
      });
    } else {
      this.productService.addProduct(formData).subscribe({
        next: (response) => {
          console.log('Produsul a fost adăugat cu succes:', response);
          window.location.href = '/dashboard';
        },
        error: (error) => {
          console.error('Eroare la trimiterea produsului:', error);
        },
      });
    }
  }
}
