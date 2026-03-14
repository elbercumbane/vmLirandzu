import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './portal/layout/navbar/navbar.component';
import { FooterComponent } from './portal/layout/footer/footer.component';
import { ThemeService } from './shared/services/theme.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Lirandzo - Transporte de Cargas';
  showChrome = true;

  private router = inject(Router);
  private themeService = inject(ThemeService);

  constructor() {
    const hideChrome = (u: string) =>
      u.startsWith('/area-cliente') || u.startsWith('/billing') || u.startsWith('/login') || u.startsWith('/recuperar-senha');
    this.showChrome = !hideChrome(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.showChrome = !hideChrome(e.urlAfterRedirects);
      });
  }
}
