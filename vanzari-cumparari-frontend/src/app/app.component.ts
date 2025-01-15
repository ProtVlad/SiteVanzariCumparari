import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar/topbar.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TopbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'vanzari-cumparari';
  isHomePage: boolean = false;  // Vom folosi acest flag pentru a determina pagina curentă

  constructor(private router: Router) {}

  ngOnInit() {
    // Ascultăm schimbările de rută
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Verificăm dacă ruta curentă este "/home" sau orice altă rută
      this.isHomePage = event.urlAfterRedirects === '/home';
    });
  }
}
