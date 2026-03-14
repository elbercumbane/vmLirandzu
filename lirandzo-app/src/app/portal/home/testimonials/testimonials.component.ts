import { Component, AfterViewInit, ElementRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

interface TestimonialStat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent implements OnInit, AfterViewInit {
  private el = inject(ElementRef);
  private transloco = inject(TranslocoService);
  testimonials: Testimonial[] = [];
  stats: TestimonialStat[] = [];

  ngOnInit(): void {
    this.buildTestimonials();
    this.buildStats();
    this.transloco.langChanges$.subscribe(() => {
      this.buildTestimonials();
      this.buildStats();
    });
  }

  private buildStats(): void {
    const t = (k: string) => this.transloco.translate(k);
    this.stats = [
      { value: t('testimonials.stat1Value'), label: t('testimonials.stat1Label') },
      { value: t('testimonials.stat2Value'), label: t('testimonials.stat2Label') },
      { value: t('testimonials.stat3Value'), label: t('testimonials.stat3Label') },
      { value: t('testimonials.stat4Value'), label: t('testimonials.stat4Label') }
    ];
  }

  private buildTestimonials(): void {
    const t = (k: string) => this.transloco.translate(k);
    this.testimonials = [
      {
        quote: t('testimonials.t1.quote'),
        author: t('testimonials.t1.author'),
        role: t('testimonials.t1.role'),
        avatar: 'images/testimonial-1.jpg'
      },
      {
        quote: t('testimonials.t2.quote'),
        author: t('testimonials.t2.author'),
        role: t('testimonials.t2.role'),
        avatar: 'images/testimonial-2.jpg'
      },
      {
        quote: t('testimonials.t3.quote'),
        author: t('testimonials.t3.author'),
        role: t('testimonials.t3.role'),
        avatar: 'images/testimonial-3.jpg'
      }
    ];
  }

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    const cards = host.querySelectorAll('.testimonial-card');
    const stats = host.querySelectorAll('.testimonial-stat');
    const section = host.querySelector('.testimonials');
    if (cards.length && section) {
      gsap.fromTo(cards, { opacity: 0, y: 30 }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%' }
      });
    }
    if (stats.length && section) {
      gsap.fromTo(stats, { opacity: 0, y: 20 }, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 70%' }
      });
    }
  }
}
