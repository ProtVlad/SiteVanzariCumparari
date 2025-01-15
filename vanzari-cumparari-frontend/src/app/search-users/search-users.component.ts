import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProfileComponent } from '../profile/profile.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-users',
  standalone: true,
  imports: [ProfileComponent, CommonModule, FormsModule],
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.css']
})
export class SearchUsersComponent implements OnInit {
  searchQuery: string = '';
  users: any[] = []; // Toți utilizatorii
  filteredUsers: any[] = []; // Utilizatori excluzând pe cel logat
  loggedUserId: string = ''; // ID-ul utilizatorului logat

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLoggedUser(); // Încarcă detaliile utilizatorului logat
    this.loadUsers(); // Încarcă utilizatorii
  }

  // Funcția care încarcă utilizatorul logat din sessionStorage
  loadLoggedUser(): void {
    const loggedUserData = sessionStorage.getItem('loggedInUser');
    if (loggedUserData) {
      const loggedUser = JSON.parse(loggedUserData);
      this.loggedUserId = loggedUser.id; // Salvează ID-ul utilizatorului logat
    }
  }

  // Funcția care încarcă toți utilizatorii
  loadUsers(): void {
    this.http.get<any>('http://localhost:3000/users').subscribe({
      next: (response) => {
        if (response.success) {
          // Accesăm lista de utilizatori din câmpul "data"
          this.users = response.users;
  
          // Găsim indexul utilizatorului logat
          const loggedUserIndex = this.users.findIndex(user => user.id === this.loggedUserId);
          
          // Dacă utilizatorul logat este găsit, îl eliminăm
          if (loggedUserIndex !== -1) {
            this.users.splice(loggedUserIndex, 1); // Eliminăm utilizatorul logat
          }
  
          this.filteredUsers = [...this.users]; // Actualizăm filteredUsers
        } else {
          console.error('Failed to load users, success flag is false.');
        }
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }
  
  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredUsers = this.users;  // Dacă nu există text, afișăm toți utilizatorii
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
}