import { Component, AfterViewInit, OnDestroy, ElementRef, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { gsap } from 'gsap';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslocoModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private router = inject(Router);
  menuOpen = false;
  langOpen = false;
  isOverHero = false;
  private heroObserver: IntersectionObserver | null = null;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleLangDropdown(): void {
    this.langOpen = !this.langOpen;
  }

  closeLangDropdown(): void {
    this.langOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
    this.closeLangDropdown();
  }

  setLang(code: 'pt' | 'en'): void {
    this.transloco.setActiveLang(code);
    this.langOpen = false;
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = code;
    }
  }

  constructor(public transloco: TranslocoService) {}

  get currentLang(): string {
    return (this.transloco.getActiveLang() || 'pt').toUpperCase();
  }

  ngAfterViewInit(): void {
    const bar = this.el.nativeElement.querySelector('.nav-bar');
    if (bar) gsap.fromTo(bar, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
    this.setupHeroObserver();
    this.router.events.subscribe(() => this.updateHeroObserver());
  }

  ngOnDestroy(): void {
    this.heroObserver?.disconnect();
    this.heroObserver = null;
  }

  private setupHeroObserver(): void {
    const url = this.router.url.split('?')[0];
    if (url !== '' && url !== '/') {
      this.isOverHero = false;
      return;
    }
    const hero = document.querySelector('.hero');
    if (!hero) {
      this.isOverHero = false;
      return;
    }
    this.heroObserver?.disconnect();
    this.heroObserver = new IntersectionObserver(
      ([e]) => { this.isOverHero = e.isIntersecting; },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    this.heroObserver.observe(hero);
    this.isOverHero = hero.getBoundingClientRect().top < window.innerHeight;
  }

  private updateHeroObserver(): void {
    setTimeout(() => this.setupHeroObserver(), 0);
  }
}
