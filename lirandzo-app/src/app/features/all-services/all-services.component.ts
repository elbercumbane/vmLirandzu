import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ServiceDetail {
  id: string;
  icon: string;
  badge: string;
  title: string;
  description: string;
  features: string[];
  image: string;
}

@Component({
  selector: 'app-all-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './all-services.component.html',
  styleUrl: './all-services.component.css'
})
export class AllServicesComponent {

  metrics = [
    { value: '+10', label: 'Anos de Experiência', trend: 'Desde 2014', fill: 100 },
    { value: '50+', label: 'Veículos na Frota', trend: 'Rastreados 24/7', fill: 85 },
    { value: '99%', label: 'Entregas no Prazo', trend: 'Confiabilidade', fill: 99 },
    { value: '24/7', label: 'Monitoramento', trend: 'GPS em tempo real', fill: 100 }
  ];

  services: ServiceDetail[] = [
    {
      id: 'SRV-01',
      icon: 'truck',
      badge: 'Frota Própria',
      title: 'Transporte Rodoviário',
      description: 'Frota própria rastreada GPS 24 horas nos corredores Joanesburgo–Maputo e rotas nacionais.',
      features: ['Cargas completas e fraccionadas', 'Rastreamento em tempo real', 'Motoristas certificados'],
      image: '/images/hero-truck-1.jpg'
    },
    {
      id: 'SRV-02',
      icon: 'procurement',
      badge: 'ZA → MZ',
      title: 'Procurement & Sourcing',
      description: 'Compra de mercadorias na África do Sul com entrega directa em Moçambique.',
      features: ['Negociação com fornecedores', 'Consolidação de cargas', 'Documentação incluída'],
      image: '/images/about-warehouse.jpg'
    },
    {
      id: 'SRV-03',
      icon: 'tracking',
      badge: 'GPS 24/7',
      title: 'Rastreamento GPS',
      description: 'Acompanhe sua carga em tempo real através do painel web ou app móvel.',
      features: ['Localização precisa', 'Notificações automáticas', 'Histórico de viagens'],
      image: '/camiao-terminal-carga.jpeg'
    },
    {
      id: 'SRV-04',
      icon: 'logistics',
      badge: 'End-to-End',
      title: 'Logística Integrada',
      description: 'Armazenagem, picking, expedição e entrega porta a porta na ZA e MZ.',
      features: ['Armazéns estratégicos', 'Cross-docking', 'Distribuição last-mile'],
      image: '/images/hero-warehouse-3.jpg'
    },
    {
      id: 'SRV-05',
      icon: 'warehouse',
      badge: 'Maputo',
      title: 'Armazenagem & Stock',
      description: 'Espaços seguros para consolidação, stockagem temporária ou distribuição.',
      features: ['Armazéns cobertos', 'Controlo digital', 'Segurança 24h'],
      image: '/images/about-warehouse.jpg'
    },
    {
      id: 'SRV-06',
      icon: 'customs',
      badge: '< 2h',
      title: 'Despacho Aduaneiro',
      description: 'Documentação e formalidades aduaneiras para importações e exportações.',
      features: ['Desalfandegamento ágil', 'Assessoria fiscal', '4 fronteiras'],
      image: '/camiao-carga-sacos.jpeg'
    }
  ];

  marqueeTags = [
    'Rastreamento GPS', 'Gestão de Frota', 'Logística Integrada', 'Despacho Aduaneiro',
    'Armazenagem', 'Transporte Rodoviário', 'Procurement', 'Cross-Border'
  ];
}
