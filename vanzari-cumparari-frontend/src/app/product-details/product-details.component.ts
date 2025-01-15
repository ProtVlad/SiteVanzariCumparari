import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: any = {};  // Obiectul pentru detaliile produsului
  user: string = '';  // Numele utilizatorului care a postat produsul
  comments: any[] = [];  // Lista comentariilor pentru produs
  newComment: string = '';  // Textul comentariului nou

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId'); // ID-ul produsului din URL

    if (productId) {
      this.fetchProductDetails(productId);  // Obține detaliile produsului
      this.fetchComments(productId);  // Obține comentariile pentru produs
    }
  }

  // Metodă pentru a obține detaliile produsului
  private fetchProductDetails(productId: string): void {
    this.http.get<any>(`http://localhost:3000/products/${productId}`).subscribe(
      (response) => {
        if (response.success) {
          this.product = response.product;

          // Obține datele utilizatorului
          this.fetchUserDetails(this.product.user_id);

          // Obține comentariile pentru produs
          this.fetchComments(productId);
        }
      },
      (error) => {
        console.error('Eroare la obținerea detaliilor produsului:', error);
      }
    );
  }

  // Metodă pentru a obține numele utilizatorului care a postat produsul
  private fetchUserDetails(userId: string): void {
    this.http.get<any>(`http://localhost:3000/users/${userId}`).subscribe(
      (response) => {
        if (response.success) {
          this.user = response.user.name; // Atribuie numele utilizatorului
        }
      },
      (error) => {
        console.error('Eroare la obținerea datelor utilizatorului:', error);
      }
    );
  }

  // Metodă pentru a obține comentariile pentru produs
  private fetchComments(productId: string): void {
    this.http.get<any>(`http://localhost:3000/comments/${productId}`).subscribe(
      (response) => {
        if (response.success) {
          this.comments = response.comments.map((comment: { name: any; picture: any; }) => ({
            ...comment,
            userName: comment.name,  // Adăugăm numele utilizatorului
            userPicture: comment.picture  // Adăugăm poza utilizatorului
          }));
        }
      },
      (error) => {
        console.error('Eroare la obținerea comentariilor:', error);
      }
    );
  }

  // Metodă pentru a trimite un comentariu nou
  submitComment(): void {
    if (!this.newComment.trim()) {
      return; // Nu trimite comentarii goale
    }
  
    const productId = this.route.snapshot.paramMap.get('productId');
  
    if (productId) {
      const commentData = {
        description: this.newComment,
        product_id: productId, // ID-ul produsului curent
        user_id: this.getUserId() // ID-ul utilizatorului curent
      };
  
      // Verificare în consolă pentru claritate (opțional)
      console.log('Adaug comentariu la produs:', productId, commentData);
  
      this.http.post<any>('http://localhost:3000/comments', commentData, {
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('authToken') // Presupunem că token-ul este salvat în sessionStorage sub cheia 'authToken'
        }
      }).subscribe(
        (response) => {
          if (response.success) {
            console.log(response.comment);
            this.comments.unshift(response.comment); // Adaugă comentariul nou la începutul listei
            this.newComment = ''; // Resetează câmpul de comentariu
  
            // Reîncarcă pagina pentru a reflecta comentariul nou (este o metodă simplă de actualizare)
            window.location.reload(); // Reîncărcați pagina pentru a actualiza complet comentariile
          }
        },
        (error) => {
          console.error('Eroare la trimiterea comentariului:', error);
        }
      );
    }
  }

  // Metodă pentru a obține ID-ul utilizatorului autentificat
  private getUserId(): string {
    const loggedInUser = sessionStorage.getItem('loggedInUser'); // Obține obiectul loggedInUser din sessionStorage
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser); // Parseați stringul JSON pentru a obține obiectul
      return user.id || ''; // Returnează userId dacă există
    }
    return ''; // Dacă nu există loggedInUser, returnează un string gol
  }
}
