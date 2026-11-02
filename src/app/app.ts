import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'ecom-frontend';
  showNav = false;

  constructor(private router: Router) {
    this.updateNav(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateNav(event.urlAfterRedirects);
      });
  }

  private updateNav(url: string) {
    const path = (url || '').split('?')[0];
    this.showNav = !!path && path !== '/' && path !== '/login' && path !== '/register';
  }
}
