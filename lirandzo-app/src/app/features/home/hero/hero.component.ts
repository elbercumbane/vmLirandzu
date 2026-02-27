import { Component, AfterViewInit, OnDestroy, ElementRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  currentSlide = 0;
  currentDate = '';
  currentTime = '';
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private timeIntervalId: ReturnType<typeof setInterval> | null = null;

  slides: Slide[] = [
    {
      image: 'frota-camioes.jpg',
      title: 'Boas-vindas à VM Lirandzo Transportes',
      subtitle: 'Transporte de mercadorias da África do Sul (Joanesburgo) para Moçambique. Sua carga em boas mãos, com logística inteligente e rastreamento em tempo real.',
      index: 0,
      stats: [
        { value: '+15', label: 'Anos de mercado' },
        { value: '50k+', label: 'Entregas/ano' },
        { value: '24h', label: 'Rastreamento' }
      ]
    },
    {
      image: 'motorista-cabine.jpg',
      title: 'Tecnologia a Serviço da Sua Carga',
      subtitle: 'Rota Joanesburgo–Maputo e todo o corredor. Frota moderna, rotas otimizadas e segurança em cada quilômetro.',
      index: 1,
      stats: [
        { value: 'ZA → MZ', label: 'Corredor ativo' },
        { value: '100%', label: 'Cargas rastreadas' },
        { value: '7/7', label: 'Operação' }
      ]
    },
    {
      image: 'camiao-carga-sacos.jpeg',
      title: 'Do Depósito até a Sua Porta',
      subtitle: 'Transporte e procurement África do Sul–Moçambique. Parceria que gera resultados.',
      index: 2,
      stats: [
        { value: 'Procurement', label: 'Compras & logística' },
        { value: 'Door-to-door', label: 'Porta a porta' },
        { value: 'Seguro', label: 'Carga segurada' }
      ]
    }
  ];

  get currentStats(): HeroStat[] {
    return this.slides[this.currentSlide].stats;
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
    this.updateDateTime();
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
