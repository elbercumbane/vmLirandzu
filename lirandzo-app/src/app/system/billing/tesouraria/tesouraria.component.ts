import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { PagamentoService, PagamentoResponse } from '../../../services/pagamento.service';
import { EncomendaService, EncomendaResponse } from '../../../services/encomenda.service';

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

@Component({
  selector: 'app-tesouraria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BillingSectionHeaderComponent],
  templateUrl: './tesouraria.component.html',
  styleUrls: ['../shared/billing-page.css', './tesouraria.component.css']
})
export class TesourariaComponent implements OnInit {
  helpItems = [
    'Os recebimentos vêm das encomendas: abra cada encomenda e registe o valor com a referência do M-Pesa ou extrato.',
    'Se ainda não verificou no banco, marque «aguarda extrato»; o valor aparece na aba Conciliação até confirmar.',
    'Após cruzar com o extrato ou app M-Pesa, confirme o pagamento para actualizar a dívida do cliente.',
    'As despesas mostradas são exemplos locais até existir módulo de despesas na base de dados.'
  ];

  activeTab: 'RECEBIMENTOS' | 'CONCILIACAO' | 'DESPESAS' | 'DIVIDAS' = 'RECEBIMENTOS';
  mostrarFormRecebimento = false;
  mostrarFormDespesa = false;

  loading = true;
  erro: string | null = null;

  novoRecebimento = {
    data: '',
    cliente: '',
    referencia: '',
    valor: null as number | null,
    metodo: '',
    encomenda: '',
    observacao: ''
  };

  novaDespesa = { data: '', descricao: '', categoria: '', valor: null as number | null, viatura: '', observacao: '' };

  metodosPagamento = ['Transferência Bancária', 'M-Pesa', 'e-Mola', 'Depósito', 'Numerário', 'Cheque'];
  categoriasDespesa = ['Combustível', 'Manutenção', 'Pneus', 'Portagem', 'Multa', 'Seguro', 'Lavagem', 'Peças', 'Salários', 'Outros'];

  recebimentos: RecebimentoRow[] = [];
  pendentesConciliacao: PagamentoResponse[] = [];
  dividasPendentes: DividaRow[] = [];

  confirmandoId: number | null = null;

  despesas = [
    { id: 1, data: '19/01/2025', descricao: 'Combustível — exemplo local', categoria: 'Combustível', valor: 12500, viatura: 'MDD-45-78', observacao: 'Registo interno' }
  ];

  constructor(
    private pagamentoService: PagamentoService,
    private encomendaService: EncomendaService
  ) {}

  ngOnInit(): void {
    const hoje = new Date().toISOString().split('T')[0];
    this.novoRecebimento.data = hoje;
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;
    this.erro = null;

    forkJoin({
      pagamentos: this.pagamentoService.listarTodos(),
      pendentes: this.pagamentoService.listarPendentesConciliacao(),
      encomendas: this.encomendaService.listarEncomendas()
    }).subscribe({
      next: ({ pagamentos, pendentes, encomendas }) => {
        this.pendentesConciliacao = pendentes;
        this.recebimentos = pagamentos.map((p) => this.mapearRecebimento(p));
        this.dividasPendentes = this.mapearDividas(encomendas);
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.erro = 'Não foi possível carregar dados da tesouraria.';
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

  registarRecebimento(): void {
    console.log('Formulário de recebimento sem encomenda: use a página da encomenda para lançar pagamentos.');
    this.mostrarFormRecebimento = false;
  }

  registarDespesa(): void {
    console.log('Nova despesa:', this.novaDespesa);
    this.mostrarFormDespesa = false;
  }

  formatarEnc(num: number | undefined): string {
    if (num == null) return '—';
    return `VML-${String(num).padStart(4, '0')}`;
  }
}
