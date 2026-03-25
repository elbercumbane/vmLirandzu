import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { NOTICIAS } from '../data/noticias.data';
import { gsap } from 'gsap';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  templateUrl: './noticias.component.html',
  styleUrl: './noticias.component.css'
})
export class NoticiasComponent implements AfterViewInit {
  private el = inject(ElementRef);
  private transloco = inject(TranslocoService);
  noticias = NOTICIAS;

  ngAfterViewInit(): void {
    const host = this.el.nativeElement as HTMLElement;
    const heroContent = host.querySelector('.noticias-hero-content') as HTMLElement | null;
    const wrapper = host.querySelector('.noticias-wrapper') as HTMLElement | null;
    const cta = host.querySelector('.noticias-cta-wrapper') as HTMLElement | null;

    if (heroContent) {
      gsap.fromTo(heroContent, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' });
    }
    if (wrapper) {
      gsap.fromTo(wrapper, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.08 });
    }
    if (cta) {
      gsap.fromTo(cta, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.12 });
    }

    const cards = host.querySelectorAll('.noticia-card');
    if (cards.length) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.12, stagger: 0.05 }
      );
    }
  }

  get noticiaDestaque() {
    return this.noticias.find(n => n.destaque);
  }

  get noticiasRecentes() {
    return this.noticias.filter(n => !n.destaque);
  }

  formatarData(data: string): string {
    const d = new Date(data);
    const locale = this.transloco.getActiveLang() === 'en' ? 'en-GB' : 'pt-MZ';
    return d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
