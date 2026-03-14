import { Component, AfterViewInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements AfterViewInit {

  private el = inject(ElementRef);

  stats = [
    { value: '+10', label: 'anos de experiência', suffix: '' },
    { value: '24/7', label: 'rastreamento GPS', suffix: '' },
    { value: '99', label: 'entregas no prazo', suffix: '%' },
    { value: '+50', label: 'veículos', suffix: '' }
  ];

  introFeatures = [
    { icon: '🌐', label: 'Cobertura Nacional' },
    { icon: '📡', label: 'Rastreamento GPS 24/7' }
  ];

  team = [
    { name: 'Operações & Motoristas', role: 'Equipa de campo', description: 'Condutores experientes e técnicos de logística que garantem cada entrega.', image: '/motorista-camiao.jpg' },
    { name: 'Suporte ao Cliente', role: 'Atendimento 24/7', description: 'Equipa dedicada a informação clara e resolução imediata de questões.', image: '/motorista-cabine.jpg' },
    { name: 'Gestão & Planeamento', role: 'Estratégia', description: 'Profissionais que otimizam rotas e garantem eficiência operacional.', image: '/equipa-maos-juntas.jpg' }
  ];

  certifications = [
    { icon: '📋', title: 'Licenciamento INATTER', desc: 'Transporte rodoviário nacional e internacional certificado.' },
    { icon: '🛡', title: 'Segurança e boas práticas', desc: 'Protocolos rigorosos de segurança e condutores formados.' },
    { icon: '✅', title: 'Parceiros auditados', desc: 'Cadeia de fornecedores verificada e auditada.' }
  ];

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
