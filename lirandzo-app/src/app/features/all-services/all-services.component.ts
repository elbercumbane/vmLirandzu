import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Service {
  image: string;
  title: string;
  description: string;
}

interface CompletedProject {
  title: string;
  description: string;
  year?: number;
  client?: string;
}

@Component({
  selector: 'app-all-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './all-services.component.html',
  styleUrl: './all-services.component.css'
})
export class AllServicesComponent {
  services: Service[] = [
    {
      image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=600&q=80',
      title: 'Transporte Rodoviário',
      description: 'Transporte de mercadorias no corredor Joanesburgo–Maputo e rotas regionais. Frota moderna e rastreamento 24h.'
    },
    {
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80',
      title: 'Procurement',
      description: 'Compras e aquisição de mercadorias na África do Sul com entrega em Moçambique. Fonte única, logística integrada.'
    },
    {
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80',
      title: 'Rastreamento em Tempo Real',
      description: 'Acompanhe sua carga a qualquer momento por aplicativo ou painel web, do depósito ao destino.'
    },
    {
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80',
      title: 'Logística Integrada',
      description: 'Armazenagem, picking, expedição e entrega porta a porta. África do Sul até Moçambique sob um único parceiro.'
    }
  ];

  completed: CompletedProject[] = [
    { title: 'Entrega de equipamento industrial', description: 'Transporte e desalfandegamento de máquinas de Joanesburgo para Maputo.', year: 2024, client: 'Indústria ABC' },
    { title: 'Procurement e entrega de materiais de construção', description: 'Aquisição na ZA e entrega em obra em Moçambique, com rastreamento em tempo real.', year: 2024, client: 'Construtora XYZ' },
    { title: 'Cargas refrigeradas Maputo–Joanesburgo', description: 'Logística integrada de produtos perecíveis no corredor.', year: 2023, client: 'Distribuidora Norte' }
  ];
}
