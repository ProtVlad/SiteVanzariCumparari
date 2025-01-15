import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  // Declari inputul user fără valoare implicită
  @Input() user: any;
  @Input() searchingUser: boolean = false;

  // Variabila care va stoca utilizatorul din sessionStorage
  private defaultUser: any = { 
    id: '',
    given_name: '', 
    family_name: '', 
    email: '',
    picture: ''
  };

  ngOnInit(): void {
    // Încarcă utilizatorul din sessionStorage, dacă există
    const loggedUserData = sessionStorage.getItem('loggedInUser');
    if (loggedUserData) {
      this.defaultUser = JSON.parse(loggedUserData);
    }

    // Dacă nu există un utilizator trimis prin input, folosește-l pe cel din sessionStorage
    if (!this.user) {
      this.user = this.defaultUser;
    }
    
    console.log(this.searchingUser);
    console.log("test");
  }
}
