import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class RoleRedirectGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.hasValidSession()) {
      return this.router.parseUrl('/login');
    }

    if (this.auth.isAdmin()) {
      return this.router.parseUrl('/admin');
    }

    return this.router.parseUrl('/shop');
  }
}
