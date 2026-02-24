import { Component, AfterViewInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type VmvType = 'missao' | 'visao' | 'valores';

interface Card {
  type: VmvType;
  title: string;
  text: string;
  icon: string;
  listItems?: string[];
  circleColor: string;
  titleColor: string;
  textColor: string;
}

@Component({
  selector: 'app-vision-mission-values',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vision-mission-values.component.html',
  styleUrl: './vision-mission-values.component.css'
})
export class VisionMissionValuesComponent implements AfterViewInit {
  private el = inject(ElementRef);
  cards: Card[] = [
    {
      type: 'missao',
      title: 'Missão',
      text: 'Promover e implementar estratégias de desenvolvimento logístico, estimulando a competitividade e a entrega de excelência em transporte e procurement.',
      icon: 'target',
      circleColor: '#0066ff',
      titleColor: '#fff',
      textColor: '#fff'
    },
    {
      type: 'visao',
      title: 'Visão',
      text: 'Ser referência em transporte de cargas e procurement no corredor África do Sul–Moçambique, com operações robustas e sustentáveis.',
      icon: 'eye',
      circleColor: '#00a3a3',
      titleColor: '#fff',
      textColor: '#fff'
    },
    {
      type: 'valores',
      title: 'Valores',
      text: '',
      icon: 'diamond',
      listItems: ['Integridade', 'Transparência', 'Inovação', 'Excelência'],
      circleColor: '#0047b3',
      titleColor: '#fff',
      textColor: '#fff'
    }
  ];

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    const cards = host.querySelectorAll('.vmv-card');
    const section = host.querySelector('.vmv');
    if (cards.length && section) {
      gsap.fromTo(cards, { opacity: 0, scale: 0.9 }, {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        scrollTrigger: { trigger: section, start: 'top 85%' }
      });
    }
  }
}
