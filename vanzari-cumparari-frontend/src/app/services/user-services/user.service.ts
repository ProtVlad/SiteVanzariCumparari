import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  getLoggedUserId(): string | null {
    const loggedUserData = sessionStorage.getItem('loggedInUser');
    if (loggedUserData) {
      const loggedUser = JSON.parse(loggedUserData);
      return loggedUser.id; // Returnează ID-ul utilizatorului logat
    }
    return null; // Dacă nu există utilizator logat
  }
}
