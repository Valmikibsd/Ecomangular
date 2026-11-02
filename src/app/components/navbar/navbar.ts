import { Component, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  loggedIn$: Observable<boolean>;
  username = '';
  isAdminMenuOpen = false;

  constructor(private auth: AuthService) {
    this.loggedIn$ = this.auth.isLoggedIn();
    this.loggedIn$.subscribe(() => {
      this.username = this.auth.getUsername();
    });
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  toggleAdminMenu() {
    this.isAdminMenuOpen = !this.isAdminMenuOpen;
  }

  closeAdminMenu() {
    this.isAdminMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeAdminMenu();
  }

  logout() {
    this.closeAdminMenu();
    this.auth.logout();
  }
}
