import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

type TrackingStep = {
  label: string;
  done: boolean;
  date: string;
  location?: string;
};

type TrackingExample = {
  code: string;
  route: string;
  status: string;
  steps: TrackingStep[];
};

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.css'
})
export class OrderTrackingComponent {
  trackingCode = '';
  searched = false;
  mockStatus = 'Digite ou escolha um código para ver os detalhes do rastreio.';
  mockSteps: TrackingStep[] = [];

  private examplesMap: Record<string, TrackingExample> = {
    'LZ-MPT-ZA-001': {
      code: 'LZ-MPT-ZA-001',
      route: 'Pagamento em Maputo → Joanesburgo → Entrega em Maputo',
      status: 'Saiu da África do Sul e está a caminho de Maputo.',
      steps: [
        {
          label: 'Pagamento confirmado',
          done: true,
          date: '20/02/2025 10:12',
          location: 'Maputo, Moçambique'
        },
        {
          label: 'Produto recebido no armazém',
          done: true,
          date: '20/02/2025 16:40',
          location: 'Maputo, Moçambique'
        },
        {
          label: 'Em trânsito para a África do Sul',
          done: true,
          date: '21/02/2025 08:05',
          location: 'Posto Fronteira Ressano Garcia'
        },
        {
          label: 'Compra consolidada na loja',
          done: true,
          date: '21/02/2025 15:20',
          location: 'Joanesburgo, África do Sul'
        },
        {
          label: 'Em trânsito para Maputo',
          done: true,
          date: '22/02/2025 07:10',
          location: 'Joanesburgo, África do Sul'
        },
        {
          label: 'Saiu para entrega ao cliente',
          done: false,
          date: '23/02/2025 09:00',
          location: 'Maputo, Moçambique'
        }
      ]
    },
    'LZ-MPT-ZA-002': {
      code: 'LZ-MPT-ZA-002',
      route: 'Maputo → Joanesburgo → Matola',
      status: 'Carga em consolidação na África do Sul.',
      steps: [
        {
          label: 'Pagamento confirmado',
          done: true,
          date: '18/02/2025 09:30',
          location: 'Maputo, Moçambique'
        },
        {
          label: 'Carga em preparação',
          done: true,
          date: '18/02/2025 14:15',
          location: 'Maputo, Moçambique'
        },
        {
          label: 'Em trânsito para a África do Sul',
          done: true,
          date: '19/02/2025 06:50',
          location: 'Estrada N4, Moçambique'
        },
        {
          label: 'Compra efetuada na loja parceira',
          done: true,
          date: '19/02/2025 13:05',
          location: 'Pretória, África do Sul'
        },
        {
          label: 'Em consolidação para retorno',
          done: false,
          date: '20/02/2025 11:40',
          location: 'Pretória, África do Sul'
        }
      ]
    },
    'LZ-MPT-ZA-003': {
      code: 'LZ-MPT-ZA-003',
      route: 'Pagamento em Maputo → Entrega final ao cliente',
      status: 'Entregue ao cliente em mãos.',
      steps: [
        {
          label: 'Pagamento confirmado',
          done: true,
          date: '10/02/2025 08:20',
          location: 'Maputo, Moçambique'
        },
        {
          label: 'Produto comprado na África do Sul',
          done: true,
          date: '10/02/2025 15:00',
          location: 'Sandton, Joanesburgo'
        },
        {
          label: 'Em trânsito para Maputo',
          done: true,
          date: '11/02/2025 06:30',
          location: 'Rodovia N4'
        },
        {
          label: 'Chegada ao centro de distribuição',
          done: true,
          date: '11/02/2025 18:10',
          location: 'Maputo, Moçambique'
        },
        {
          label: 'Saiu para entrega',
          done: true,
          date: '12/02/2025 09:15',
          location: 'Maputo, Moçambique'
        },
        {
          label: 'Entregue ao cliente',
          done: true,
          date: '12/02/2025 11:02',
          location: 'Cliente, Maputo'
        }
      ]
    }
  };

  exampleCodes = Object.values(this.examplesMap).map((example) => ({
    code: example.code,
    route: example.route,
    status: example.status
  }));

  selectedExampleCode: string = this.exampleCodes[0]?.code ?? '';

  get selectedExample(): TrackingExample | null {
    return this.examplesMap[this.selectedExampleCode] ?? null;
  }

  search(): void {
    const raw = this.trackingCode.trim();
    if (!raw) {
      this.searched = false;
      this.mockStatus = 'Digite ou escolha um código para ver os detalhes do rastreio.';
      this.mockSteps = [];
      return;
    }

    const code = raw.toUpperCase();
    this.searched = true;

    const example = this.examplesMap[code];

    if (example) {
      this.mockStatus = example.status;
      this.mockSteps = example.steps;
    } else {
      this.mockStatus = 'Rastreio simulado em andamento.';
      this.mockSteps = [
        {
          label: 'Código recebido no sistema',
          done: true,
          date: 'Hoje',
          location: 'Maputo, Moçambique'
        },
        {
          label: 'Aguardando atualização da transportadora',
          done: false,
          date: '—',
          location: '—'
        }
      ];
    }
  }

  selectExample(code: string): void {
    this.selectedExampleCode = code;
    this.trackingCode = code;
    this.search();
  }
}
