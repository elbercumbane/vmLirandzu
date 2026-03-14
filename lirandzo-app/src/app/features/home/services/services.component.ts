import { Component, AfterViewInit, ElementRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Service {
  image: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit, AfterViewInit {
  private el = inject(ElementRef);
  private transloco = inject(TranslocoService);
  services: Service[] = [];

  ngOnInit(): void {
    this.buildServices();
    this.transloco.langChanges$.subscribe(() => this.buildServices());
  }

  private buildServices(): void {
    const t = (k: string) => this.transloco.translate(k);
    this.services = [
      { image: 'images/hero-truck-1.jpg', title: t('services.transport.title'), description: t('services.transport.desc') },
      { image: 'images/about-warehouse.jpg', title: t('services.procurement.title'), description: t('services.procurement.desc') },
      { image: 'images/event-1.jpg', title: t('services.tracking.title'), description: t('services.tracking.desc') },
      { image: 'images/hero-warehouse-3.jpg', title: t('services.logistics.title'), description: t('services.logistics.desc') }
    ];
  }

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    const cards = host.querySelectorAll('.service-card');
    const section = host.querySelector('.services');
    if (cards.length && section) {
      gsap.fromTo(cards, { opacity: 0, y: 40 }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%' }
      });
    }
  }
}
