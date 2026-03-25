import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { Cliente, ClienteService } from '../../services/cliente.service';
import { EncomendaService, EncomendaResponse } from '../../services/encomenda.service';
import { CotacaoService, CotacaoResponse } from '../../services/cotacao.service';

interface Order {
  id: string;
  date: string;
  origin: string;
  destination: string;
  status: 'em_transito' | 'entregue' | 'pendente' | 'em_processamento';
  statusLabel: string;
  progress?: number;
  lastUpdate?: string;
  estimatedDelivery?: string;
}

interface Quote {
  id: string;
  date: string;
  description: string;
  status: 'aprovada' | 'pendente' | 'expirada';
  statusLabel: string;
  value: string;
}

interface MonthData {
  month: string;
  count: number;
  pct: number;
}

@Component({
  selector: 'app-client-area',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-area.component.html',
  styleUrl: './client-area.component.css'
})
export class ClientAreaComponent implements OnInit, OnDestroy {
  activeTab: 'dashboard' | 'produtos' | 'cotacoes' | 'rastreio' | 'perfil' = 'dashboard';
  sidebarCollapsed = false;
  mobileOpen = false;

  currentDate = '';
  currentTime = '';
  greeting = '';
  private clockInterval: ReturnType<typeof setInterval> | null = null;

  selectedOrder: Order | null = null;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);
  private readonly encomendaService = inject(EncomendaService);
  private readonly cotacaoService = inject(CotacaoService);

  client: Cliente | null = null;
  isLoadingClient = true;
  showAccessAssistant = false;
  accessStep: 'inicio' | 'ja-cliente' | 'nao-cliente' = 'inicio';

  filterYear = '2026';
  filterDateFrom = '';
  filterDateTo = '';
  filterStatus = '';
  availableYears = ['2024', '2025', '2026'];

  orders: Order[] = [
    {
      id: 'LRZ-2026-0042',
      date: '22/02/2026',
      origin: 'Maputo',
      destination: 'Beira',
      status: 'em_transito',
      statusLabel: 'Em trânsito',
      progress: 65,
      lastUpdate: 'Chimoio — 26/02/2026, 08:30',
      estimatedDelivery: '27/02/2026'
    },
    {
      id: 'LRZ-2026-0038',
      date: '18/02/2026',
      origin: 'Maputo',
      destination: 'Johannesburg',
      status: 'entregue',
      statusLabel: 'Entregue',
      progress: 100,
      lastUpdate: 'Johannesburg — 20/02/2026, 14:15',
      estimatedDelivery: '20/02/2026'
    },
    {
      id: 'LRZ-2026-0035',
      date: '14/02/2026',
      origin: 'Nacala',
      destination: 'Maputo',
      status: 'entregue',
      statusLabel: 'Entregue',
      progress: 100,
      lastUpdate: 'Maputo — 17/02/2026, 10:00',
      estimatedDelivery: '17/02/2026'
    },
    {
      id: 'LRZ-2026-0050',
      date: '25/02/2026',
      origin: 'Matola',
      destination: 'Nampula',
      status: 'pendente',
      statusLabel: 'Pendente',
      progress: 0,
      lastUpdate: 'Aguardando recolha',
      estimatedDelivery: '01/03/2026'
    },
    {
      id: 'LRZ-2026-0048',
      date: '24/02/2026',
      origin: 'Maputo',
      destination: 'Tete',
      status: 'em_processamento',
      statusLabel: 'Em processamento',
      progress: 15,
      lastUpdate: 'Armazém Maputo — 25/02/2026, 16:45',
      estimatedDelivery: '28/02/2026'
    }
  ];

  quotes: Quote[] = [
    {
      id: 'COT-2026-0120',
      date: '24/02/2026',
      description: 'Transporte de materiais de construção — Maputo → Beira',
      status: 'pendente',
      statusLabel: 'Pendente',
      value: '—'
    },
    {
      id: 'COT-2026-0115',
      date: '20/02/2026',
      description: 'Carga fraccionada — Matola → Nampula',
      status: 'aprovada',
      statusLabel: 'Aprovada',
      value: '45 000 MZN'
    },
    {
      id: 'COT-2026-0108',
      date: '12/02/2026',
      description: 'Contentor 20ft — Maputo → Johannesburg',
      status: 'aprovada',
      statusLabel: 'Aprovada',
      value: '82 500 MZN'
    },
    {
      id: 'COT-2026-0095',
      date: '01/02/2026',
      description: 'Transporte de equipamentos — Beira → Maputo',
      status: 'expirada',
      statusLabel: 'Expirada',
      value: '38 000 MZN'
    }
  ];

  monthlyOrders: MonthData[] = [
    { month: 'Set', count: 3, pct: 37 },
    { month: 'Out', count: 5, pct: 62 },
    { month: 'Nov', count: 4, pct: 50 },
    { month: 'Dez', count: 8, pct: 100 },
    { month: 'Jan', count: 6, pct: 75 },
    { month: 'Fev', count: 5, pct: 62 }
  ];

  get pendingOrders(): Order[] {
    return this.orders.filter(o => o.status !== 'entregue');
  }

  get filteredOrders(): Order[] {
    return this.orders.filter(o => {
      if (this.filterStatus && o.status !== this.filterStatus) return false;
      if (this.filterYear) {
        const year = o.date.split('/')[2];
        if (year !== this.filterYear) return false;
      }
      if (this.filterDateFrom) {
        const orderDate = this.parseDate(o.date);
        const from = new Date(this.filterDateFrom);
        if (orderDate < from) return false;
      }
      if (this.filterDateTo) {
        const orderDate = this.parseDate(o.date);
        const to = new Date(this.filterDateTo);
        if (orderDate > to) return false;
      }
      return true;
    });
  }

  get filteredCount(): number { return this.filteredOrders.length; }

  get totalOrders(): number { return this.orders.length; }
  get deliveredCount(): number { return this.orders.filter(o => o.status === 'entregue').length; }
  get inTransitCount(): number { return this.orders.filter(o => o.status === 'em_transito').length; }
  get pendingCount(): number { return this.orders.filter(o => o.status === 'pendente').length; }
  get processingCount(): number { return this.orders.filter(o => o.status === 'em_processamento').length; }

  get deliveredPct(): number { return this.totalOrders ? (this.deliveredCount / this.totalOrders) * 100 : 0; }
  get undeliveredPct(): number { return this.totalOrders ? (this.pendingOrders.length / this.totalOrders) * 100 : 0; }
  get inTransitPct(): number { return this.totalOrders ? (this.inTransitCount / this.totalOrders) * 100 : 0; }
  get pendingCountPct(): number { return this.totalOrders ? (this.pendingCount / this.totalOrders) * 100 : 0; }
  get processingCountPct(): number { return this.totalOrders ? (this.processingCount / this.totalOrders) * 100 : 0; }

  get aprovadasCount(): number { return this.quotes.filter(q => q.status === 'aprovada').length; }
  get aprovadasProgressPct(): number { return this.quotes.length ? (this.aprovadasCount / this.quotes.length) * 100 : 0; }

  get statusDonut(): string {
    const total = this.totalOrders;
    if (total === 0) return 'conic-gradient(#e2e8f0 0deg 360deg)';
    const delivered = (this.deliveredCount / total) * 360;
    const transit = (this.inTransitCount / total) * 360;
    const pending = (this.pendingCount / total) * 360;
    const processing = (this.processingCount / total) * 360;
    let a = 0;
    const segments: string[] = [];
    segments.push(`#16a34a ${a}deg ${a + delivered}deg`); a += delivered;
    segments.push(`#0284c7 ${a}deg ${a + transit}deg`); a += transit;
    segments.push(`#ea580c ${a}deg ${a + pending}deg`); a += pending;
    segments.push(`#7c3aed ${a}deg ${a + processing}deg`);
    return `conic-gradient(${segments.join(', ')})`;
  }

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.bootstrapClientArea();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  private updateClock(): void {
    const now = new Date();
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.currentDate = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
    this.currentTime = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const hour = now.getHours();
    if (hour < 12) this.greeting = 'Bom dia';
    else if (hour < 18) this.greeting = 'Boa tarde';
    else this.greeting = 'Boa noite';
  }

  private parseDate(dateStr: string): Date {
    const [d, m, y] = dateStr.split('/');
    return new Date(+y, +m - 1, +d);
  }

  private bootstrapClientArea(): void {
    if (!this.auth.isLoggedIn) {
      this.isLoadingClient = false;
      this.showAccessAssistant = true;
      return;
    }

    const email = this.auth.currentUser()?.email;
    if (!email) return;

    this.isLoadingClient = true;
    this.clienteService.obterClientePorEmail(email).subscribe({
      next: (cliente: Cliente) => {
        this.client = cliente;
        const clienteId = cliente.id;
        if (!clienteId) {
          this.isLoadingClient = false;
          return;
        }
        this.loadClientData(clienteId);
      },
      error: () => {
        // Mantém os dados de exemplo caso o cliente não seja encontrado.
        this.isLoadingClient = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login-cliente'], { queryParams: { returnUrl: '/area-cliente' } });
  }

  private loadClientData(clienteId: number): void {
    forkJoin({
      encomendas: this.encomendaService.listarEncomendasPorCliente(clienteId),
      cotacoes: this.cotacaoService.listarCotacoesPorCliente(clienteId)
    }).subscribe({
      next: ({ encomendas, cotacoes }) => {
        this.orders = encomendas.map(e => this.mapEncomendaToOrder(e));
        this.quotes = cotacoes.map(c => this.mapCotacaoToQuote(c));

        this.rebuildYearFilters();
        this.rebuildMonthlyOrders();
        this.isLoadingClient = false;
      },
      error: () => {
        this.isLoadingClient = false;
      }
    });
  }

  private mapEncomendaToOrder(encomenda: EncomendaResponse): Order {
    const rawDate = (encomenda as any).dataEncomenda ?? encomenda.dataEncomenda ?? (encomenda as any).dataCriacao ?? '';
    const date = this.formatBackendDate(rawDate) || '';
    const baseDate = date ? this.parseDate(date) : new Date();

    const statusRaw = String((encomenda as any).status ?? '').toUpperCase();
    if (statusRaw === 'PAID') {
      return {
        id: encomenda.invoiceNumber ? String(encomenda.invoiceNumber) : `LRZ-${encomenda.numeroEncomenda}`,
        date,
        origin: encomenda.origem,
        destination: encomenda.destino,
        status: 'entregue',
        statusLabel: 'Entregue',
        progress: 100,
        lastUpdate: this.formatBackendDateTime((encomenda as any).dataAtualizacao ?? (encomenda as any).dataCriacao),
        estimatedDelivery: date ? this.formatBackendDate(this.toISODate(this.addDays(baseDate, 7))) : undefined
      };
    }

    if (statusRaw === 'PARTIAL') {
      return {
        id: encomenda.invoiceNumber ? String(encomenda.invoiceNumber) : `LRZ-${encomenda.numeroEncomenda}`,
        date,
        origin: encomenda.origem,
        destination: encomenda.destino,
        status: 'em_processamento',
        statusLabel: 'Em processamento',
        progress: 55,
        lastUpdate: this.formatBackendDateTime((encomenda as any).dataAtualizacao ?? (encomenda as any).dataCriacao),
        estimatedDelivery: date ? this.formatBackendDate(this.toISODate(this.addDays(baseDate, 7))) : undefined
      };
    }

    return {
      id: encomenda.invoiceNumber ? String(encomenda.invoiceNumber) : `LRZ-${encomenda.numeroEncomenda}`,
      date,
      origin: encomenda.origem,
      destination: encomenda.destino,
      status: 'pendente',
      statusLabel: 'Pendente',
      progress: 0,
      lastUpdate: this.formatBackendDateTime((encomenda as any).dataAtualizacao ?? (encomenda as any).dataCriacao),
      estimatedDelivery: date ? this.formatBackendDate(this.toISODate(this.addDays(baseDate, 7))) : undefined
    };
  }

  private mapCotacaoToQuote(cotacao: CotacaoResponse): Quote {
    const date = this.formatBackendDate(cotacao.dataCotacao) || '';

    const statusRaw = String(cotacao.status ?? '').toUpperCase();
    let status: Quote['status'] = 'pendente';
    let statusLabel = 'Pendente';

    if (statusRaw === 'EXPIRED' || statusRaw === 'CANCELLED') {
      status = 'expirada';
      statusLabel = 'Expirada';
    } else if (statusRaw === 'RESPONDED' || statusRaw === 'QUOTATION_GENERATED' || statusRaw === 'INVOICED') {
      status = 'aprovada';
      statusLabel = 'Aprovada';
    }

    const value = typeof cotacao.valorTotal === 'number'
      ? `${this.formatNumberMZN(cotacao.valorTotal)} MZN`
      : '—';

    return {
      id: cotacao.referencia ? String(cotacao.referencia) : `COT-${cotacao.id}`,
      date,
      description: cotacao.descricaoCarga ? cotacao.descricaoCarga : `${cotacao.origem} → ${cotacao.destino}`,
      status,
      statusLabel,
      value
    };
  }

  private rebuildYearFilters(): void {
    const years = Array.from(new Set(this.orders.map(o => o.date.split('/')[2]).filter(Boolean))).sort();
    this.availableYears = years.length ? years : [String(new Date().getFullYear())];
    if (!this.filterYear || !this.availableYears.includes(this.filterYear)) {
      this.filterYear = this.availableYears[this.availableYears.length - 1];
    }
  }

  private rebuildMonthlyOrders(): void {
    const monthShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const monthStarts = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (5 - i), 1));

    const counts = monthStarts.map(ms => {
      return this.orders.filter(o => {
        if (!o.date) return false;
        const d = this.parseDate(o.date);
        return d.getFullYear() === ms.getFullYear() && d.getMonth() === ms.getMonth();
      }).length;
    });

    const max = Math.max(...counts, 0);
    this.monthlyOrders = monthStarts.map((ms, idx) => ({
      month: monthShort[ms.getMonth()],
      count: counts[idx],
      pct: max ? Math.round((counts[idx] / max) * 100) : 0
    }));
  }

  private formatBackendDate(dateStr?: string): string {
    if (!dateStr) return '';
    const s = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  }

  private formatBackendDateTime(dateTimeStr?: string): string | undefined {
    if (!dateTimeStr) return undefined;
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return this.formatBackendDate(dateTimeStr);
    return d.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private toISODate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private formatNumberMZN(value: number): string {
    const formatted = new Intl.NumberFormat('pt-MZ', { maximumFractionDigits: 0 }).format(value);
    // pt-MZ pode usar '.' como separador de milhares — convertemos para espaço.
    return formatted.replace(/\./g, ' ');
  }

  setTab(tab: 'dashboard' | 'produtos' | 'cotacoes' | 'rastreio' | 'perfil'): void {
    this.activeTab = tab;
    if (tab !== 'rastreio') this.selectedOrder = null;
  }

  trackOrder(order: Order): void {
    this.selectedOrder = order;
    this.activeTab = 'rastreio';
  }

  clearFilters(): void {
    this.filterYear = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filterStatus = '';
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }
  toggleMobileSidebar(): void { this.mobileOpen = !this.mobileOpen; }
}
