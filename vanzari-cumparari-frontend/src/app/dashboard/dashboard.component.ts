import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserCardComponent } from '../user-card/user-card.component';
import { Router } from '@angular/router';
declare var handleSignout: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private router: Router){}
  userProfile: any;
  allUsers: any[] = []; 

  ngOnInit() {
    this.userProfile = JSON.parse(sessionStorage.getItem("loggedInUser") || "");

    fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.userProfile),
    })
      .then(response => response.json())
      .then(data => console.log('User saved to database:', data))
      .catch(error => console.error('Error saving user:', error));

    fetch('http://localhost:3000/api/users', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        this.allUsers = data;
        console.log('All users:', this.allUsers);
      })
      .catch(error => console.error('Error fetching users:', error));
  }

  handleSignOut(){
    handleSignout();
    sessionStorage.removeItem("loggedInUser");
    this.router.navigate(["/login"]).then(()=>{
      window.location.reload();
    });
  }
}
