import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';
import { AuthService } from '../../../shared/services/auth.service';
import { EncomendaService, EncomendaResponse } from '../../../services/encomenda.service';
import {
  PagamentoService,
  PagamentoResponse,
  VerificationStatusApi
} from '../../../services/pagamento.service';

interface LinhaFactura {
  id: number;
  numero: string;
  factura: string;
  cliente: string;
  total: number;
  pago: number;
  divida: number;
  status: string;
  data: string;
}

@Component({
  selector: 'app-encomendas-pagamentos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    BillingSectionHeaderComponent,
    NotificationPopupComponent
  ],
  templateUrl: './encomendas-pagamentos.component.html',
  styleUrls: ['../shared/billing-page.css', './encomendas-pagamentos.component.css']
})
export class EncomendasPagamentosComponent implements OnInit {
  private encomendaService = inject(EncomendaService);
  private pagamentoService = inject(PagamentoService);
  private auth = inject(AuthService);

  linhas: LinhaFactura[] = [];
  pendentesAprovacao: PagamentoResponse[] = [];
  pendentesBanco: PagamentoResponse[] = [];

  loading = true;
  error: string | null = null;
  searchTerm = '';

  modalAberto = false;
  linhaModal: LinhaFactura | null = null;
  /** Pagamentos da encomenda do modal — para calcular o tecto (inclui pendentes de aprovação). */
  pagamentosEncomendaModal: PagamentoResponse[] = [];
  carregandoPagamentosModal = false;
  aGuardarPagamento = false;
  confirmandoId: number | null = null;
  processandoAprovacaoId: number | null = null;

  novoPagamento = {
    valor: null as number | null,
    dataPagamento: '',
    referencia: '',
    metodoPagamento: 'Transferência Bancária',
    observacoes: ''
  };

  metodosPagamento = ['Transferência Bancária'];

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  get podeAprovarOuConciliar(): boolean {
    return this.auth.isAdmin || this.auth.isGestor;
  }

  ngOnInit(): void {
    const hoje = new Date().toISOString().split('T')[0];
    this.novoPagamento.dataPagamento = hoje;
    this.carregarTudo();
  }

  carregarTudo(): void {
    this.loading = true;
    this.error = null;

    const reqs: {
      encomendas: ReturnType<EncomendaService['listarEncomendas']>;
      aprovacao?: ReturnType<PagamentoService['listarPendentesAprovacao']>;
      banco?: ReturnType<PagamentoService['listarPendentesConciliacao']>;
    } = {
      encomendas: this.encomendaService.listarEncomendas()
    };

    if (this.podeAprovarOuConciliar) {
      reqs.aprovacao = this.pagamentoService.listarPendentesAprovacao().pipe(
        catchError(() => of([] as PagamentoResponse[]))
      );
      reqs.banco = this.pagamentoService.listarPendentesConciliacao().pipe(
        catchError(() => of([] as PagamentoResponse[]))
      );
    }

    forkJoin({
      encomendas: reqs.encomendas,
      aprovacao: reqs.aprovacao ?? of([] as PagamentoResponse[]),
      banco: reqs.banco ?? of([] as PagamentoResponse[])
    }).subscribe({
      next: ({ encomendas, aprovacao, banco }) => {
        this.linhas = encomendas.map((e) => this.mapear(e));
        this.pendentesAprovacao = aprovacao;
        this.pendentesBanco = banco;
        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar dados.';
        this.loading = false;
        this.linhas = [];
      }
    });
  }

  private mapear(e: EncomendaResponse): LinhaFactura {
    let statusDisplay = 'NÃO PAGO';
    const st = (e.status || '').toUpperCase();
    if (st === 'PAID' || st === 'PAGO') statusDisplay = 'PAGO';
    else if (st === 'PARTIAL' || st === 'PARCIAL') statusDisplay = 'PARCIAL';
    else if (st === 'UNPAID' || st === 'NAO_PAGO' || st === 'NÃO_PAGO') statusDisplay = 'NÃO PAGO';

    const dataFormatada = e.dataEncomenda
      ? new Date(e.dataEncomenda).toLocaleDateString('pt-MZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : '';

    return {
      id: e.numeroEncomenda,
      numero: `VML-${String(e.numeroEncomenda).padStart(4, '0')}`,
      factura: e.invoiceNumber?.trim() || '—',
      cliente: e.cliente?.nome || '—',
      total: e.valorTotal || 0,
      pago: e.valorPago || 0,
      divida: e.valorDivida || 0,
      status: statusDisplay,
      data: dataFormatada
    };
  }

  get filtradas(): LinhaFactura[] {
    if (!this.searchTerm.trim()) return this.linhas;
    const t = this.searchTerm.toLowerCase();
    return this.linhas.filter(
      (r) =>
        r.numero.toLowerCase().includes(t) ||
        r.factura.toLowerCase().includes(t) ||
        r.cliente.toLowerCase().includes(t)
    );
  }

  abrirModal(l: LinhaFactura): void {
    this.linhaModal = l;
    this.modalAberto = true;
    this.pagamentosEncomendaModal = [];
    this.carregandoPagamentosModal = true;
    this.novoPagamento = {
      valor: null,
      dataPagamento: new Date().toISOString().split('T')[0],
      referencia: '',
      metodoPagamento: 'Transferência Bancária',
      observacoes: ''
    };
    this.pagamentoService.listarPorEncomenda(l.id).subscribe({
      next: (lista) => {
        this.pagamentosEncomendaModal = lista;
        this.carregandoPagamentosModal = false;
      },
      error: () => {
        this.pagamentosEncomendaModal = [];
        this.carregandoPagamentosModal = false;
      }
    });
  }

  maxValorPermitidoModal(): number {
    if (!this.linhaModal) return 0;
    const total = this.linhaModal.total;
    const ocupado = this.pagamentosEncomendaModal
      .filter((p) => p.verificationStatus !== 'REJECTED')
      .reduce((s, p) => s + (p.valor || 0), 0);
    return Math.max(0, Math.round((total - ocupado) * 100) / 100);
  }

  /** Aviso imediato no formulário quando o operador ultrapassa o tecto. */
  valorDigitadoExcedeMaximoModal(): boolean {
    if (!this.linhaModal || this.carregandoPagamentosModal) return false;
    const v = this.novoPagamento.valor;
    if (v == null || v <= 0) return false;
    return v > this.maxValorPermitidoModal() + 0.004;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.linhaModal = null;
    this.aGuardarPagamento = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeFecharModal(event: KeyboardEvent): void {
    if (!this.modalAberto) return;
    event.preventDefault();
    this.fecharModal();
  }

  registarPagamento(): void {
    if (this.carregandoPagamentosModal) {
      this.toast('Aguarde a carregar os pagamentos desta factura.', 'error');
      return;
    }
    if (!this.linhaModal || !this.novoPagamento.valor || this.novoPagamento.valor <= 0) {
      this.toast('Indique um valor válido.', 'error');
      return;
    }
    if (!this.novoPagamento.referencia?.trim()) {
      this.toast('Indique a referência do extrato ou do movimento.', 'error');
      return;
    }
    const max = this.maxValorPermitidoModal();
    if (this.novoPagamento.valor > max + 0.004) {
      this.toast(
        `O valor não pode exceder ${max.toFixed(2)} MZN (soma dos lançamentos não pode ultrapassar o total da factura).`,
        'error'
      );
      return;
    }

    const verificationStatus: VerificationStatusApi =
      this.auth.isAdmin || this.auth.isGestor ? 'CONFIRMED' : 'PENDING_APPROVAL';

    this.aGuardarPagamento = true;
    const payload = {
      encomenda: { numeroEncomenda: this.linhaModal.id },
      valor: this.novoPagamento.valor,
      dataPagamento: this.novoPagamento.dataPagamento || undefined,
      referencia: this.novoPagamento.referencia?.trim() || undefined,
      observacoes: this.novoPagamento.observacoes?.trim() || undefined,
      metodoPagamento: this.novoPagamento.metodoPagamento || undefined,
      verificationStatus
    };

    this.pagamentoService.criar(payload).subscribe({
      next: () => {
        this.aGuardarPagamento = false;
        const msg =
          payload.verificationStatus === 'PENDING_APPROVAL'
            ? 'Pedido enviado. Um gestor ou administrador deve aprovar antes de contabilizar na dívida.'
            : 'Pagamento registado e contabilizado na dívida.';
        this.toast(msg, 'success');
        this.fecharModal();
        this.carregarTudo();
      },
      error: (err: unknown) => {
        this.aGuardarPagamento = false;
        const msg =
          err && typeof err === 'object' && 'error' in err
            ? (err as { error?: { error?: string } }).error?.error
            : null;
        this.toast(msg || 'Erro ao registar pagamento.', 'error');
      }
    });
  }

  confirmarNoExtrato(p: PagamentoResponse): void {
    this.confirmandoId = p.id;
    this.pagamentoService.confirmarConciliacao(p.id).subscribe({
      next: () => {
        this.confirmandoId = null;
        this.toast('Pagamento confirmado. Valor contabilizado na dívida.', 'success');
        this.carregarTudo();
      },
      error: (err: unknown) => {
        this.confirmandoId = null;
        const msg =
          err && typeof err === 'object' && 'error' in err
            ? (err as { error?: { error?: string } }).error?.error
            : null;
        this.toast(msg || 'Erro ao confirmar.', 'error');
      }
    });
  }

  aprovarPagamento(p: PagamentoResponse): void {
    this.processandoAprovacaoId = p.id;
    this.pagamentoService.aprovarPagamentoGestor(p.id).subscribe({
      next: () => {
        this.processandoAprovacaoId = null;
        this.toast('Pagamento aprovado e contabilizado na dívida.', 'success');
        this.carregarTudo();
      },
      error: (err: unknown) => {
        this.processandoAprovacaoId = null;
        const msg =
          err && typeof err === 'object' && 'error' in err
            ? (err as { error?: { error?: string } }).error?.error
            : null;
        this.toast(msg || 'Erro ao aprovar.', 'error');
      }
    });
  }

  recusarPagamento(p: PagamentoResponse): void {
    const motivo = typeof window !== 'undefined' ? window.prompt('Motivo da recusa:', '') : null;
    if (motivo === null) return;
    const trimmed = (motivo || '').trim();
    if (!trimmed) {
      this.toast('Indique um motivo para recusar.', 'error');
      return;
    }
    this.processandoAprovacaoId = p.id;
    this.pagamentoService.recusarPagamentoGestor(p.id, trimmed).subscribe({
      next: () => {
        this.processandoAprovacaoId = null;
        this.toast('Pagamento recusado.', 'success');
        this.carregarTudo();
      },
      error: (err: unknown) => {
        this.processandoAprovacaoId = null;
        const msg =
          err && typeof err === 'object' && 'error' in err
            ? (err as { error?: { error?: string } }).error?.error
            : null;
        this.toast(msg || 'Erro ao recusar.', 'error');
      }
    });
  }

  labelVerificacao(status: string): string {
    switch (status) {
      case 'PENDING_BANK':
        return 'Aguarda extrato';
      case 'PENDING_APPROVAL':
        return 'Aguarda aprovação';
      case 'REJECTED':
        return 'Recusado';
      default:
        return 'Confirmado';
    }
  }

  badgeVerificacao(status: string): string {
    switch (status) {
      case 'PENDING_BANK':
      case 'PENDING_APPROVAL':
        return 'badge-warning';
      case 'REJECTED':
        return 'badge-danger';
      default:
        return 'badge-success';
    }
  }

  formatarData(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  rotuloEncomenda(p: PagamentoResponse): string {
    const n = p.encomenda?.numeroEncomenda;
    if (n != null) return `VML-${String(n).padStart(4, '0')}`;
    return '—';
  }

  private toast(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
  }
}
