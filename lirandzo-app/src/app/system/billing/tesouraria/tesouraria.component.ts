import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth.service';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';
import { PagamentoService, PagamentoResponse } from '../../../services/pagamento.service';
import { EncomendaService, EncomendaResponse } from '../../../services/encomenda.service';
import { ReciboService, ReciboResponse } from '../../../services/recibo.service';

interface RecebimentoRow {
  id: number;
  data: string;
  cliente: string;
  referencia: string;
  valor: number;
  metodo: string;
  encomendaLabel: string;
  encomendaId: number;
  factura: string;
  estado: string;
  verificationStatus: string;
}

interface DividaRow {
  cliente: string;
  encomendaLabel: string;
  encomendaId: number;
  valor: number;
  dias: number;
}

export type TesourariaAba = 'RECIBOS' | 'BAIXAS' | 'RECEBIMENTOS' | 'DESPESAS' | 'DIVIDAS';

@Component({
  selector: 'app-tesouraria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './tesouraria.component.html',
  styleUrls: ['../shared/billing-page.css', './tesouraria.component.css']
})
export class TesourariaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  modoFluxoBaixas = false;
  somenteBaixasPagina = false;
  pageTitle = 'Recibos e movimentos';
  pageSubtitle = 'Recibos emitidos automaticamente ao confirmar pagamentos, movimentos e conciliação';
  helpTitle = 'Pagamentos e recibos';
  helpItems = [
    'Cada pagamento confirmado (baixa na factura) gera um recibo numerado (ex.: RCB-2026-00001).',
    'Na aba Baixas concilia movimentos antigos pendentes de extrato — perfil diferente da lista de recibos.',
    'Use o extrato na aba Recibos para imprimir um resumo por período.',
    'As despesas mostradas são exemplos locais até existir módulo de despesas na base de dados.'
  ];

  fluxoBaixasPassos = [
    {
      n: 1,
      titulo: 'Registar pagamento',
      texto: 'Em Facturas → Registar pagamentos ou na ficha da encomenda: valor, referência e método. Admin/gestor confirma na hora; técnico fica em aprovação.'
    },
    {
      n: 2,
      titulo: 'Recibo automático',
      texto: 'Ao confirmar o pagamento (ou aprovar o do técnico), o sistema emite o recibo com número único — consulte na aba Recibos.'
    },
    {
      n: 3,
      titulo: 'Baixas / conciliação',
      texto: 'Movimentos antigos «aguarda extrato» são confirmados aqui (aba Baixas) por Admin ou Gestor após verificar o banco.'
    },
    {
      n: 4,
      titulo: 'Extrato e dívidas',
      texto: 'Na aba Recibos use «Extrato do período» para impressão. A aba Dívidas lista facturas por pagar.'
    }
  ];

  activeTab: TesourariaAba = 'RECIBOS';
  mostrarFormDespesa = false;

  loading = true;
  erro: string | null = null;

  novaDespesa = { data: '', descricao: '', categoria: '', valor: null as number | null, viatura: '', observacao: '' };

  categoriasDespesa = ['Combustível', 'Manutenção', 'Pneus', 'Portagem', 'Multa', 'Seguro', 'Lavagem', 'Peças', 'Salários', 'Outros'];

  recebimentos: RecebimentoRow[] = [];
  pendentesConciliacao: PagamentoResponse[] = [];
  pendentesAprovacao: PagamentoResponse[] = [];
  dividasPendentes: DividaRow[] = [];
  recibos: ReciboResponse[] = [];

  extratoDataInicio = '';
  extratoDataFim = '';

  confirmandoId: number | null = null;

  despesas = [
    { id: 1, data: '19/01/2025', descricao: 'Combustível — exemplo local', categoria: 'Combustível', valor: 12500, viatura: 'MDD-45-78', observacao: 'Registo interno' }
  ];

  constructor(
    private pagamentoService: PagamentoService,
    private encomendaService: EncomendaService,
    private reciboService: ReciboService
  ) {}

  get podeConfirmarConciliacao(): boolean {
    return this.auth.canConfirmPayment();
  }

  ngOnInit(): void {
    this.modoFluxoBaixas = !!this.route.snapshot.data['tesourariaModoBaixas'];
    this.somenteBaixasPagina = !!this.route.snapshot.data['tesourariaSomenteBaixas'];
    const abaInicial = this.route.snapshot.data['tesourariaAbaInicial'] as TesourariaAba | undefined;
    if (abaInicial === 'BAIXAS' || this.modoFluxoBaixas) {
      this.activeTab = 'BAIXAS';
    } else if (abaInicial === 'RECEBIMENTOS') {
      this.activeTab = 'RECEBIMENTOS';
    } else {
      this.activeTab = 'RECIBOS';
    }

    if (this.modoFluxoBaixas) {
      this.pageTitle = 'Baixas e recibos';
      this.pageSubtitle = 'Conciliação com o banco e recibos emitidos ao confirmar pagamentos';
      this.helpTitle = 'Como usar baixas e recibos';
      this.helpItems = [
        'A aba Baixas é só para confirmar movimentos antigos no extrato (Admin/Gestor). O formulário é distinto da lista de recibos.',
        'Cada pagamento confirmado gera um recibo — veja a aba Recibos ou abra «Recibos e movimentos» no menu.',
        'Pense na factura como documento único: vários pagamentos parciais geram vários recibos na mesma factura.',
        'Cliente em dívida aparece na aba Dívidas e na lista de facturas.'
      ];
    }

    const hoje = new Date();
    const ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    this.extratoDataInicio = ini.toISOString().split('T')[0];
    this.extratoDataFim = hoje.toISOString().split('T')[0];

    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;
    this.erro = null;

    forkJoin({
      pagamentos: this.pagamentoService.listarTodos(),
      pendentes: this.pagamentoService.listarPendentesConciliacao(),
      aprovacao: this.pagamentoService.listarPendentesAprovacao().pipe(catchError(() => of([] as PagamentoResponse[]))),
      encomendas: this.encomendaService.listarEncomendas(),
      recibos: this.reciboService.listar().pipe(catchError(() => of([] as ReciboResponse[])))
    }).subscribe({
      next: ({ pagamentos, pendentes, aprovacao, encomendas, recibos }) => {
        this.pendentesAprovacao = aprovacao;
        this.pendentesConciliacao = pendentes;
        this.recebimentos = pagamentos.map((p) => this.mapearRecebimento(p));
        this.dividasPendentes = this.mapearDividas(encomendas);
        this.recibos = recibos;
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.erro = 'Não foi possível carregar dados.';
        this.loading = false;
      }
    });
  }

  private mapearRecebimento(p: PagamentoResponse): RecebimentoRow {
    const enc = p.encomenda;
    const num = enc?.numeroEncomenda ?? 0;
    return {
      id: p.id,
      data: p.dataPagamento
        ? new Date(p.dataPagamento).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—',
      cliente: enc?.cliente?.nome || '—',
      referencia: p.referencia || '—',
      valor: p.valor || 0,
      metodo: p.metodoPagamento || '—',
      encomendaLabel: num ? `VML-${String(num).padStart(4, '0')}` : '—',
      encomendaId: num,
      factura: enc?.invoiceNumber || '—',
      estado: p.verificationStatus === 'PENDING_BANK' ? 'Aguarda extrato' : 'Confirmado',
      verificationStatus: p.verificationStatus
    };
  }

  private mapearDividas(encomendas: EncomendaResponse[]): DividaRow[] {
    const hoje = new Date();
    return encomendas
      .filter((e) => (e.valorDivida || 0) > 0)
      .map((e) => {
        const d0 = e.dataEncomenda ? new Date(e.dataEncomenda) : hoje;
        const dias = Math.max(0, Math.floor((hoje.getTime() - d0.getTime()) / 86400000));
        return {
          cliente: e.cliente?.nome || '—',
          encomendaLabel: `VML-${String(e.numeroEncomenda).padStart(4, '0')}`,
          encomendaId: e.numeroEncomenda,
          valor: e.valorDivida || 0,
          dias
        };
      })
      .sort((a, b) => b.dias - a.dias);
  }

  get totalRecebido(): number {
    return this.recebimentos.filter((r) => r.verificationStatus === 'CONFIRMED').reduce((s, r) => s + r.valor, 0);
  }

  get totalPendenteConciliacao(): number {
    return this.pendentesConciliacao.reduce((s, p) => s + (p.valor || 0), 0);
  }

  get totalDespesas(): number {
    return this.despesas.reduce((s, d) => s + d.valor, 0);
  }

  get saldo(): number {
    return this.totalRecebido - this.totalDespesas;
  }

  get totalDividas(): number {
    return this.dividasPendentes.reduce((s, d) => s + d.valor, 0);
  }

  get despesasPorCategoria() {
    const map = new Map<string, number>();
    this.despesas.forEach((d) => map.set(d.categoria, (map.get(d.categoria) || 0) + d.valor));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }

  getDiasBadgeClass(dias: number): string {
    if (dias > 14) return 'badge-danger';
    if (dias > 7) return 'badge-warning';
    return 'badge-info';
  }

  confirmarPagamento(p: PagamentoResponse): void {
    if (!this.podeConfirmarConciliacao) {
      return;
    }
    this.confirmandoId = p.id;
    this.pagamentoService.confirmarConciliacao(p.id).subscribe({
      next: () => {
        this.confirmandoId = null;
        this.carregarDados();
      },
      error: () => {
        this.confirmandoId = null;
      }
    });
  }

  registarDespesa(): void {
    this.mostrarFormDespesa = false;
  }

  formatarEnc(num: number | undefined): string {
    if (num == null) return '—';
    return `VML-${String(num).padStart(4, '0')}`;
  }

  formatarDataRecibo(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  imprimirRecibo(r: ReciboResponse): void {
    const w = window.open('', '_blank');
    if (!w) return;
    const titulo = escapeHtml(r.numeroPublico);
    const corpo =
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Recibo ${titulo}</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 560px; margin: 0 auto; color: #111; }
  h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
  .num { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
  table { width: 100%; border-collapse: collapse; margin-top: 1.25rem; font-size: 0.95rem; }
  td { padding: 0.35rem 0; border-bottom: 1px solid #e5e7eb; }
  td:first-child { color: #64748b; width: 42%; }
  .valor { font-size: 1.35rem; font-weight: 700; margin-top: 1rem; }
  @media print { body { padding: 1rem; } }
</style></head><body>
  <h1>Recibo de pagamento</h1>
  <p class="num">${escapeHtml(r.numeroPublico)}</p>
  <p style="margin:0.25rem 0 0;font-size:0.9rem;color:#64748b">Emitido em ${escapeHtml(this.formatarDataRecibo(r.dataEmissao))}</p>
  <table>
    <tr><td>Cliente</td><td>${escapeHtml(r.clienteNome || '—')}</td></tr>
    <tr><td>Factura</td><td>${escapeHtml(r.numeroFactura || '—')}</td></tr>
    <tr><td>Referência do pagamento</td><td>${escapeHtml(r.referenciaPagamento || '—')}</td></tr>
    <tr><td>Meio</td><td>${escapeHtml(r.metodoPagamento || '—')}</td></tr>
  </table>
  <p class="valor">${(r.valor ?? 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MZN</p>
  <p style="font-size:0.8rem;color:#64748b;margin-top:2rem;">Documento gerado automaticamente pelo sistema ao confirmar o pagamento.</p>
` +
      '<script>window.onload=function(){window.print();}<\/script></body></html>';
    w.document.write(corpo);
    w.document.close();
  }

  private recibosFiltradosExtrato(): ReciboResponse[] {
    const ini = this.extratoDataInicio ? new Date(this.extratoDataInicio + 'T00:00:00').getTime() : 0;
    const fim = this.extratoDataFim ? new Date(this.extratoDataFim + 'T23:59:59').getTime() : Number.MAX_SAFE_INTEGER;
    return this.recibos.filter((r) => {
      const t = r.dataEmissao ? new Date(r.dataEmissao).getTime() : 0;
      return t >= ini && t <= fim;
    });
  }

  imprimirExtratoRecibos(): void {
    const lista = this.recibosFiltradosExtrato();
    const total = lista.reduce((s, r) => s + (r.valor || 0), 0);
    const linhas = lista
      .map(
        (r) =>
          `<tr><td>${escapeHtml(this.formatarDataRecibo(r.dataEmissao))}</td><td>${escapeHtml(r.numeroPublico)}</td><td>${escapeHtml(r.clienteNome || '—')}</td><td>${escapeHtml(r.numeroFactura || '—')}</td><td style="text-align:right">${(r.valor ?? 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}</td></tr>`
      )
      .join('');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Extrato de recibos</title>
<style>
body{font-family:system-ui,sans-serif;padding:1.5rem;color:#111}
h1{font-size:1.15rem;margin:0 0 .5rem}
table{width:100%;border-collapse:collapse;font-size:0.88rem;margin-top:1rem}
th,td{padding:0.45rem 0.35rem;border-bottom:1px solid #e5e7eb;text-align:left}
th{background:#f8fafc;font-weight:600}
.tot{font-weight:700;margin-top:1rem;text-align:right}
</style></head><body>
<h1>Extrato de recibos</h1>
<p style="margin:0;color:#64748b;font-size:0.9rem">Período: ${escapeHtml(this.extratoDataInicio || '—')} a ${escapeHtml(this.extratoDataFim || '—')}</p>
<table><thead><tr><th>Data</th><th>Recibo</th><th>Cliente</th><th>Factura</th><th style="text-align:right">Valor (MZN)</th></tr></thead>
<tbody>${linhas || '<tr><td colspan="5">Nenhum recibo neste período.</td></tr>'}</tbody></table>
<p class="tot">Total: ${total.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN (${lista.length} recibo(s))</p>
` +
      '<script>window.onload=function(){window.print();}<\/script></body></html>');
    w.document.close();
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
