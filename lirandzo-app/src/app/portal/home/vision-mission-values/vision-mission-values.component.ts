import { Component, AfterViewInit, ElementRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
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
  imports: [CommonModule, TranslocoModule],
  templateUrl: './vision-mission-values.component.html',
  styleUrl: './vision-mission-values.component.css'
})
export class VisionMissionValuesComponent implements OnInit, AfterViewInit {
  private el = inject(ElementRef);
  private transloco = inject(TranslocoService);
  cards: Card[] = [];

  ngOnInit(): void {
    this.buildCards();
    this.transloco.langChanges$.subscribe(() => this.buildCards());
  }

  private buildCards(): void {
    const t = (k: string) => this.transloco.translate(k);
    this.cards = [
      {
        type: 'missao',
        title: t('vmv.mission.title'),
        text: t('vmv.mission.text'),
        icon: 'target',
        circleColor: '#13243A',
        titleColor: '#f8fafc',
        textColor: '#cbd5e1'
      },
      {
        type: 'visao',
        title: t('vmv.vision.title'),
        text: t('vmv.vision.text'),
        icon: 'eye',
        circleColor: '#1a4a72',
        titleColor: '#f8fafc',
        textColor: '#cbd5e1'
      },
      {
        type: 'valores',
        title: t('vmv.values.title'),
        text: '',
        icon: 'heart',
        listItems: [
          this.transloco.translate('vmv.values.item1'),
          this.transloco.translate('vmv.values.item2'),
          this.transloco.translate('vmv.values.item3'),
          this.transloco.translate('vmv.values.item4')
        ],
        circleColor: '#0f5c6e',
        titleColor: '#f8fafc',
        textColor: '#cbd5e1'
      }
    ];
  }

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
