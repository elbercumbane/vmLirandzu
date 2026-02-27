import { Component, AfterViewInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  imports: [CommonModule, RouterLink],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements AfterViewInit {
  private el = inject(ElementRef);
  services: Service[] = [
    {
      image: 'camiao-carga-sacos.jpeg',
      title: 'Transporte Rodoviário',
      description: 'Transporte de mercadorias no corredor Joanesburgo–Maputo e rotas regionais. Frota moderna e rastreamento 24h.'
    },
    {
      image: 'frota-camioes.jpg',
      title: 'Procurement',
      description: 'Compras e aquisição de mercadorias na África do Sul com entrega em Moçambique. Fonte única, logística integrada.'
    },
    {
      image: 'motorista-cabine.jpg',
      title: 'Rastreamento em Tempo Real',
      description: 'Acompanhe sua carga a qualquer momento por aplicativo ou painel web, do depósito ao destino.'
    },
    {
      image: 'frota-lirandzo-armazem.jpeg',
      title: 'Logística Integrada',
      description: 'Armazenagem, picking, expedição e entrega porta a porta. África do Sul até Moçambique sob um único parceiro.'
    }
  ];

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
