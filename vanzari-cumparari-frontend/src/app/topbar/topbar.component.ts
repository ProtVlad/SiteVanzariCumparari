import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
declare var handleSignout: any;

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {
  currentRoute: string = '';  // Variabila pentru a salva ruta curentă

  constructor(private router: Router) {}

  ngOnInit() {
    // Ascultă evenimentele de navigare (pentru a actualiza ruta curentă la fiecare schimbare de pagină)
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;  // Actualizează currentRoute la sfârșitul navigării
      }
    });
  }

  // Funcție pentru a verifica dacă ne aflăm pe pagina Home
  isHomePage(): boolean {
    return this.currentRoute === '/' || this.currentRoute === '/home';
  }

  // Funcții pentru navigare
  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToAddProduct() {
    this.router.navigate(['/add-product']);
  }

  goToProducts() {
    this.router.navigate(['/my-products']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToSearchUsers() {
    this.router.navigate(['/search-users']);
  }

  logout() {
    handleSignout();
    sessionStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("token");
    this.router.navigate(["/"]).then(()=>{
      window.location.reload();
    });
  }
}
