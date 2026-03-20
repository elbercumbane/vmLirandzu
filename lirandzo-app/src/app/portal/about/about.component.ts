import { Component, AfterViewInit, ElementRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit, AfterViewInit {
  private el = inject(ElementRef);
  private transloco = inject(TranslocoService);

  stats: { value: string; label: string; suffix: string }[] = [];
  introFeatures: { icon: string; label: string }[] = [];
  team: { name: string; role: string; description: string; image: string }[] = [];
  certifications: { icon: string; title: string; desc: string }[] = [];

  ngOnInit(): void {
    const build = () => this.buildContent();
    this.transloco.load(this.transloco.getActiveLang() || 'pt').subscribe(() => build());
    this.transloco.langChanges$.subscribe(lang => {
      this.transloco.load(lang).subscribe(() => build());
    });
  }

  private buildContent(): void {
    const t = (k: string) => this.transloco.translate(k);
    this.stats = [
      { value: '+10', label: t('about.stats.s1'), suffix: '' },
      { value: '24/7', label: t('about.stats.s2'), suffix: '' },
      { value: '99', label: t('about.stats.s3'), suffix: '%' },
      { value: '+50', label: t('about.stats.s4'), suffix: '' }
    ];
    this.introFeatures = [
      { icon: '🌐', label: t('about.who.f1') },
      { icon: '📡', label: t('about.who.f2') }
    ];
    this.team = [
      { name: t('about.team.m1.name'), role: t('about.team.m1.role'), description: t('about.team.m1.desc'), image: '/motorista-camiao.jpg' },
      { name: t('about.team.m2.name'), role: t('about.team.m2.role'), description: t('about.team.m2.desc'), image: '/motorista-cabine.jpg' },
      { name: t('about.team.m3.name'), role: t('about.team.m3.role'), description: t('about.team.m3.desc'), image: '/equipa-maos-juntas.jpg' }
    ];
    this.certifications = [
      { icon: '📋', title: t('about.certs.c1.title'), desc: t('about.certs.c1.desc') },
      { icon: '🛡', title: t('about.certs.c2.title'), desc: t('about.certs.c2.desc') },
      { icon: '✅', title: t('about.certs.c3.title'), desc: t('about.certs.c3.desc') }
    ];
  }

  ngAfterViewInit(): void {
    const host = this.el.nativeElement as HTMLElement;

    gsap.fromTo(host.querySelector('.hero-content'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.fromTo(host.querySelectorAll('.stat-item'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.8, stagger: 0.1, ease: 'power3.out' });

    const sections = host.querySelectorAll('.reveal');
    sections.forEach(s => {
      gsap.fromTo(s, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 85%' } });
    });

    const teamCards = host.querySelectorAll('.team-section .info-card');
    const teamSection = host.querySelector('.team-section');
    if (teamSection && teamCards.length) {
      gsap.fromTo(teamCards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: teamSection, start: 'top 85%' } });
    }

    const certCards = host.querySelectorAll('.certs .info-card');
    const certSection = host.querySelector('.certs')?.closest('section');
    if (certSection && certCards.length) {
      gsap.fromTo(certCards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: certSection, start: 'top 85%' } });
    }
  }
}
