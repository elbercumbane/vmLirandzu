import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

type TrackingStep = {
  label: string;
  done: boolean;
  date: string;
  location?: string;
  longDuration?: boolean;
};

type TrackingExample = {
  code: string;
  route: string;
  status: string;
  packageId: string;
  steps: TrackingStep[];
};

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.css'
})
export class OrderTrackingComponent implements AfterViewInit {
  @ViewChild('heroContent') heroContentRef!: ElementRef<HTMLElement>;

  trackingCode = '';
  searched = false;
  mockStatus = 'Digite ou escolha um código para ver os detalhes do rastreio.';
  mockSteps: TrackingStep[] = [];
  currentFatura = '';
  currentPackageId = '';
  currentRoute = '';

  private examplesMap: Record<string, TrackingExample> = {
    '001': {
      code: '001',
      route: 'Pagamento em Maputo → Joanesburgo → Entrega em Maputo',
      status: 'Saiu da África do Sul e está a caminho de Maputo.',
      packageId: 'PKG-001-MZ',
      steps: [
        { label: 'Pagamento confirmado', done: true, date: '20/02/2025 10:12', location: 'Maputo, Moçambique' },
        { label: 'Produto recebido no armazém', done: true, date: '20/02/2025 16:40', location: 'Maputo, Moçambique' },
        { label: 'Em trânsito para a África do Sul', done: true, date: '21/02/2025 08:05', location: 'Posto Fronteira Ressano Garcia', longDuration: true },
        { label: 'Compra consolidada na loja', done: true, date: '21/02/2025 15:20', location: 'Joanesburgo, África do Sul' },
        { label: 'Em trânsito para Maputo', done: true, date: '22/02/2025 07:10', location: 'Joanesburgo, África do Sul', longDuration: true },
        { label: 'Saiu para entrega ao cliente', done: false, date: '23/02/2025 09:00', location: 'Maputo, Moçambique', longDuration: true }
      ]
    },
    '002': {
      code: '002',
      route: 'Maputo → Joanesburgo → Matola',
      status: 'Carga em consolidação na África do Sul.',
      packageId: 'PKG-002-MZ',
      steps: [
        { label: 'Pagamento confirmado', done: true, date: '18/02/2025 09:30', location: 'Maputo, Moçambique' },
        { label: 'Carga em preparação', done: true, date: '18/02/2025 14:15', location: 'Maputo, Moçambique' },
        { label: 'Em trânsito para a África do Sul', done: true, date: '19/02/2025 06:50', location: 'Estrada N4, Moçambique', longDuration: true },
        { label: 'Compra efetuada na loja parceira', done: true, date: '19/02/2025 13:05', location: 'Pretória, África do Sul' },
        { label: 'Em consolidação para retorno', done: false, date: '20/02/2025 11:40', location: 'Pretória, África do Sul', longDuration: true }
      ]
    },
    '003': {
      code: '003',
      route: 'Pagamento em Maputo → Entrega final ao cliente',
      status: 'Entregue ao cliente em mãos.',
      packageId: 'PKG-003-MZ',
      steps: [
        { label: 'Pagamento confirmado', done: true, date: '10/02/2025 08:20', location: 'Maputo, Moçambique' },
        { label: 'Produto comprado na África do Sul', done: true, date: '10/02/2025 15:00', location: 'Sandton, Joanesburgo' },
        { label: 'Em trânsito para Maputo', done: true, date: '11/02/2025 06:30', location: 'Rodovia N4', longDuration: true },
        { label: 'Chegada ao centro de distribuição', done: true, date: '11/02/2025 18:10', location: 'Maputo, Moçambique' },
        { label: 'Saiu para entrega', done: true, date: '12/02/2025 09:15', location: 'Maputo, Moçambique', longDuration: true },
        { label: 'Entregue ao cliente', done: true, date: '12/02/2025 11:02', location: 'Cliente, Maputo' }
      ]
    }
  };

  ngAfterViewInit(): void {
    const el = this.heroContentRef?.nativeElement;
    if (!el) return;
    const title = el.querySelector('.tracking-hero-title');
    const desc = el.querySelector('.tracking-hero-description');
    const form = el.querySelector('.tracking-hero-form');
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(title, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75 })
      .fromTo(desc, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.45')
      .fromTo(form, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35');
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
    this.currentFatura = code;

    const example = this.examplesMap[code];

    if (example) {
      this.mockStatus = example.status;
      this.mockSteps = example.steps;
      this.currentPackageId = example.packageId;
      this.currentRoute = example.route;
    } else {
      this.mockStatus = 'Rastreio simulado em andamento.';
      this.currentPackageId = '';
      this.currentRoute = '';
      this.mockSteps = [
        { label: 'Código recebido no sistema', done: true, date: 'Hoje', location: 'Maputo, Moçambique' },
        { label: 'Aguardando atualização da transportadora', done: false, date: '—', location: '—' }
      ];
    }
  }
}
