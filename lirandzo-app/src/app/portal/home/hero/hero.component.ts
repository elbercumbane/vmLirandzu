import { Component, AfterViewInit, OnDestroy, ElementRef, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { gsap } from 'gsap';

interface HeroStat {
  value: string;
  label: string;
}

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  index: number;
  stats: HeroStat[];
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private transloco = inject(TranslocoService);
  currentSlide = 0;
  currentDate = '';
  currentTime = '';
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private timeIntervalId: ReturnType<typeof setInterval> | null = null;

  slides: Slide[] = [];

  ngOnInit(): void {
    this.updateDateTime();
    const build = () => this.buildSlides();
    this.transloco.load(this.transloco.getActiveLang() || 'pt').subscribe(() => build());
    this.transloco.langChanges$.subscribe(lang => {
      this.transloco.load(lang).subscribe(() => build());
    });
  }

  private buildSlides(): void {
    const t = (key: string) => this.transloco.translate(key);
    this.slides = [
      {
        image: 'images/hero-truck-1.jpg',
        title: t('hero.slide1.title'),
        subtitle: t('hero.slide1.subtitle'),
        index: 0,
        stats: [
          { value: t('hero.slide1.stat1'), label: t('hero.slide1.stat1Label') },
          { value: t('hero.slide1.stat2'), label: t('hero.slide1.stat2Label') },
          { value: t('hero.slide1.stat3'), label: t('hero.slide1.stat3Label') }
        ]
      },
      {
        image: 'images/hero-truck-2.jpg',
        title: t('hero.slide2.title'),
        subtitle: t('hero.slide2.subtitle'),
        index: 1,
        stats: [
          { value: t('hero.slide2.stat1'), label: t('hero.slide2.stat1Label') },
          { value: t('hero.slide2.stat2'), label: t('hero.slide2.stat2Label') },
          { value: t('hero.slide2.stat3'), label: t('hero.slide2.stat3Label') }
        ]
      },
      {
        image: 'images/hero-warehouse-3.jpg',
        title: t('hero.slide3.title'),
        subtitle: t('hero.slide3.subtitle'),
        index: 2,
        stats: [
          { value: t('hero.slide3.stat1'), label: t('hero.slide3.stat1Label') },
          { value: t('hero.slide3.stat2'), label: t('hero.slide3.stat2Label') },
          { value: t('hero.slide3.stat3'), label: t('hero.slide3.stat3Label') }
        ]
      }
    ];
  }

  get currentStats(): HeroStat[] {
    return this.getCurrentSlide().stats;
  }

  get slideCounterCurrent(): string {
    return (this.currentSlide + 1).toString().padStart(2, '0');
  }

  get slideCounterTotal(): string {
    return this.slides.length.toString().padStart(2, '0');
  }

  getCurrentSlide(): Slide {
    const s = this.slides[this.currentSlide] ?? this.slides[0];
    return s ?? { image: '', title: '', subtitle: '', index: 0, stats: [] };
  }

  private updateDateTime(): void {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('pt-MZ', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    this.currentTime = now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetInterval();
  }

  next(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.resetInterval();
  }

  prev(): void {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.resetInterval();
  }

  private resetInterval(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.next(), 6000);
  }

  ngAfterViewInit(): void {
    this.timeIntervalId = setInterval(() => this.updateDateTime(), 1000);
    this.intervalId = setInterval(() => this.next(), 6000);

    const host = this.el.nativeElement;
    const content = host.querySelector('.hero-content');
    const ctaButtons = host.querySelector('.hero-cta-buttons');
    if (content) gsap.fromTo(content, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' });
    if (ctaButtons) {
      gsap.fromTo(ctaButtons, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.8, ease: 'power3.out' });
      const btns = ctaButtons.querySelectorAll('.btn-hero-cta');
      if (btns.length) {
        gsap.to(btns, {
          y: -4,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: { each: 0.4, from: 'end' },
          delay: 1.5
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.timeIntervalId) clearInterval(this.timeIntervalId);
  }
}
