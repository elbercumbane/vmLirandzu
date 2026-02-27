import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ServiceDetail {
  icon: string;
  title: string;
  description: string;
  features: string[];
  color: 'blue' | 'dark' | 'soft';
}

interface CompletedProject {
  title: string;
  description: string;
  year: number;
  client: string;
}

@Component({
  selector: 'app-all-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './all-services.component.html',
  styleUrl: './all-services.component.css'
})
export class AllServicesComponent {
  services: ServiceDetail[] = [
    {
      icon: 'truck',
      title: 'Transporte Rodoviário',
      description: 'Transporte de mercadorias nos corredores Joanesburgo–Maputo, Beira–Tete e outras rotas nacionais e regionais. Frota moderna com rastreamento GPS 24 horas e motoristas experientes.',
      features: [
        'Cobertura nacional e internacional',
        'Frota própria rastreada por GPS',
        'Cargas completas e fraccionadas',
        'Entregas porta a porta',
        'Motoristas certificados e treinados'
      ],
      color: 'blue'
    },
    {
      icon: 'procurement',
      title: 'Procurement',
      description: 'Serviço de compras e aquisição de mercadorias na África do Sul com entrega directa em Moçambique. Fonte única de abastecimento com logística integrada do fornecedor ao destino final.',
      features: [
        'Negociação com fornecedores na ZA',
        'Consolidação de cargas',
        'Documentação aduaneira incluída',
        'Transporte integrado origem–destino',
        'Relatórios e visibilidade total'
      ],
      color: 'dark'
    },
    {
      icon: 'tracking',
      title: 'Rastreamento em Tempo Real',
      description: 'Acompanhe a sua carga a qualquer momento através do nosso painel web ou aplicação móvel. Receba notificações automáticas em cada etapa do transporte, do depósito ao destino.',
      features: [
        'Painel de controlo online',
        'Notificações por SMS e e-mail',
        'Localização GPS em tempo real',
        'Histórico completo de movimentações',
        'Previsão de chegada actualizada'
      ],
      color: 'soft'
    },
    {
      icon: 'logistics',
      title: 'Logística Integrada',
      description: 'Armazenagem, picking, expedição e entrega porta a porta. Da África do Sul até Moçambique, toda a cadeia logística gerida por um único parceiro com processos optimizados.',
      features: [
        'Armazéns estratégicos',
        'Picking e embalagem',
        'Cross-docking',
        'Gestão de inventário',
        'Distribuição last-mile'
      ],
      color: 'blue'
    },
    {
      icon: 'warehouse',
      title: 'Armazenagem',
      description: 'Espaços de armazenamento seguros e monitorizados para consolidação, stockagem temporária ou distribuição. Ideais para quem precisa de um hub logístico antes da entrega final.',
      features: [
        'Armazéns cobertos e seguros',
        'Controlo de stock digital',
        'Áreas por tipo de mercadoria',
        'Carga e descarga mecanizada',
        'Acesso 24/7 sob pedido'
      ],
      color: 'dark'
    },
    {
      icon: 'customs',
      title: 'Despacho Aduaneiro',
      description: 'Tratamos de toda a documentação e formalidades aduaneiras para importações e exportações. Desalfandegamento ágil nas fronteiras entre Moçambique, África do Sul, Eswatini e Zimbabué.',
      features: [
        'Documentação de importação/exportação',
        'Desalfandegamento em fronteiras',
        'Assessoria em regulamentação',
        'Coordenação com autoridades',
        'Redução de tempos de espera'
      ],
      color: 'soft'
    }
  ];

  completed: CompletedProject[] = [
    {
      title: 'Entrega de equipamento industrial',
      description: 'Transporte e desalfandegamento de máquinas pesadas de Joanesburgo para Maputo, com escolta especial.',
      year: 2025,
      client: 'Indústria ABC'
    },
    {
      title: 'Procurement de materiais de construção',
      description: 'Aquisição de materiais na África do Sul e entrega em obra em Moçambique, com rastreamento em tempo real.',
      year: 2025,
      client: 'Construtora XYZ'
    },
    {
      title: 'Cargas refrigeradas Maputo–Joanesburgo',
      description: 'Logística integrada de produtos perecíveis no corredor, com controlo de temperatura durante todo o percurso.',
      year: 2024,
      client: 'Distribuidora Norte'
    },
    {
      title: 'Distribuição nacional de bens de consumo',
      description: 'Armazenagem em Maputo e distribuição para Beira, Nampula e Tete com entregas semanais programadas.',
      year: 2024,
      client: 'Grupo Comercial Sul'
    }
  ];
}
