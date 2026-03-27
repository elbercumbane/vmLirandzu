import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';
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
  private transloco = inject(TranslocoService);

  constructor() {
    const savedLang = (typeof localStorage !== 'undefined' ? localStorage.getItem('app_lang') : null) as 'pt' | 'en' | null;
    if (savedLang === 'pt' || savedLang === 'en') {
      this.transloco.setActiveLang(savedLang);
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.lang = savedLang;
      }
    }

    this.transloco.langChanges$.subscribe(lang => {
      if (typeof localStorage !== 'undefined') localStorage.setItem('app_lang', lang);
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.lang = lang;
      }
    });

    const hideChrome = (u: string) =>
      u.startsWith('/area-cliente') ||
      u.startsWith('/billing') ||
      u.startsWith('/login') ||
      u.startsWith('/recuperar-senha');
    this.showChrome = !hideChrome(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.showChrome = !hideChrome(e.urlAfterRedirects);
      });
  }
}
