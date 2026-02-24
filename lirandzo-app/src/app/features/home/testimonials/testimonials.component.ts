import { Component, AfterViewInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  /** Foto do serviço/entrega que o cliente recebeu ou realizou (estilo BeForward) */
  deliveryPhoto?: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent implements AfterViewInit {
  private el = inject(ElementRef);
  testimonials: Testimonial[] = [
    {
      quote: 'Entregas sempre no prazo. O rastreamento em tempo real nos dá tranquilidade total.',
      author: 'Maria Silva',
      role: 'Gerente de Logística, Indústria ABC',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80',
      deliveryPhoto: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=600&q=80'
    },
    {
      quote: 'Parceria de anos. Profissionalismo e tecnologia que fazem a diferença no dia a dia.',
      author: 'Carlos Mendes',
      role: 'Diretor Comercial, Comércio XYZ',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80',
      deliveryPhoto: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80'
    },
    {
      quote: 'Melhor custo-benefício do mercado. Recomendo a Lirandzo para quem precisa de confiança.',
      author: 'Ana Costa',
      role: 'CEO, Distribuidora Norte',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80',
      deliveryPhoto: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80'
    }
  ];

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    const cards = host.querySelectorAll('.testimonial-card');
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
  }
}
