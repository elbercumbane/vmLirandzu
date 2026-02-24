import { Component, AfterViewInit, ElementRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements AfterViewInit {
  private el = inject(ElementRef);
  menuOpen = false;
  langOpen = false;
  currentLang = 'PT';

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

  setLang(code: 'pt' | 'en'): void {
    this.currentLang = code === 'pt' ? 'PT' : 'EN';
  }

  ngAfterViewInit(): void {
    const bar = this.el.nativeElement.querySelector('.nav-bar');
    if (bar) gsap.fromTo(bar, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
  }
}
