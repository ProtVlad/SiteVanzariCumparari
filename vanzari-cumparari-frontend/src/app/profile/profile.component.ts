import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @Input() user: any = { 
    id: '',
    given_name: '', 
    family_name: '', 
    email: '',
    picture: ''
  };  // User va putea fi transmis ca input de către componenta părinte
  @Input() searchingUser: boolean = false;

  // Variabilă pentru utilizatorul din sessionStorage
  loggedUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient, // Injectăm HttpClient
    private router: Router
  ) {}

  ngOnInit(): void {
    // Încarcă utilizatorul din sessionStorage
    const loggedUserData = sessionStorage.getItem('loggedInUser');
    if (loggedUserData) {
      this.loggedUser = JSON.parse(loggedUserData);
    }

    // Dacă user-ul nu a fost transmis prin input, îl încărcăm din sessionStorage sau din API
    if (!this.user || !this.user.id) {
      this.loadUser();
    }
  }

  private loadUser() {
    // Extrage id-ul din URL
    const userId = this.route.snapshot.paramMap.get('userId');
    
    // Verifică dacă userId există în URL
    if (userId) {
      // Cerere HTTP pentru a obține utilizatorul pe baza id-ului
      this.http.get<any>(`http://localhost:3000/users/${userId}`).subscribe(
        (response) => {
          if (response.success) {
            this.user = response.user; // Îl asignăm la variabila user
          } else {
            console.error('Utilizatorul nu a fost găsit');
          }
        },
        (error) => {
          console.error('Eroare la cererea HTTP:', error);
        }
      );
    } else {
      // Dacă nu există userId în URL, folosește utilizatorul din sessionStorage
      const loggedUserData = sessionStorage.getItem('loggedInUser');
      if (loggedUserData) {
        this.user = JSON.parse(loggedUserData);
      }
    }
  }

  viewProducts() {
    // Verifică dacă ID-ul utilizatorului din sessionStorage este diferit de cel din URL
    if (this.loggedUser && this.loggedUser.id !== this.user.id) {
      // Navighează către pagina de produse pentru utilizatorul curent
      this.router.navigate([`/listing/${this.user.id}`]);
    }
  }
}
