import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { EncomendaService, EncomendaResponse } from '../../../services/encomenda.service';
import { PagamentoService, PagamentoResponse } from '../../../services/pagamento.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

@Component({
  selector: 'app-encomendas-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './encomendas-detalhe.component.html',
  styleUrls: ['../shared/billing-page.css', './encomendas-detalhe.component.css']
})
export class EncomendasDetalheComponent implements OnInit {
  encomenda: EncomendaResponse | null = null;
  pagamentos: PagamentoResponse[] = [];
  loading = true;
  error: string | null = null;
  encomendaId: number | null = null;

  novoPagamento = {
    valor: null as number | null,
    dataPagamento: '',
    referencia: '',
    metodoPagamento: '',
    observacoes: '',
    aguardaExtrato: false
  };

  metodosPagamento = ['Transferência Bancária', 'M-Pesa', 'e-Mola', 'Depósito', 'Numerário', 'Cheque'];

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  aGuardarPagamento = false;
  confirmandoId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private encomendaService: EncomendaService,
    private pagamentoService: PagamentoService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.encomendaId = +id;
      const hoje = new Date().toISOString().split('T')[0];
      this.novoPagamento.dataPagamento = hoje;
      this.carregarTudo();
    } else {
      this.error = 'ID da encomenda não fornecido';
      this.loading = false;
    }
  }

  carregarTudo() {
    if (!this.encomendaId) return;
    this.loading = true;
    this.error = null;

    forkJoin({
      encomenda: this.encomendaService.obterEncomenda(this.encomendaId),
      pagamentos: this.pagamentoService.listarPorEncomenda(this.encomendaId).pipe(
        catchError((e) => {
          console.warn('Pagamentos não carregados (continuação sem lista):', e);
          return of([] as PagamentoResponse[]);
        })
      )
    }).subscribe({
      next: ({ encomenda, pagamentos }) => {
        this.encomenda = encomenda;
        this.pagamentos = pagamentos;
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        const status =
          err && typeof err === 'object' && 'status' in err ? (err as { status?: number }).status : undefined;
        if (status === 404) {
          this.error = 'Encomenda não encontrada. Verifique o número na lista ou volte atrás.';
        } else {
          this.error =
            'Não foi possível carregar a encomenda. Confirme que o servidor está a correr e reinicie o backend se acabou de actualizar o código.';
        }
        this.loading = false;
      }
    });
  }

  get valorPendenteExtrato(): number {
    return this.pagamentos
      .filter((p) => p.verificationStatus === 'PENDING_BANK')
      .reduce((s, p) => s + (p.valor || 0), 0);
  }

  registarPagamento(): void {
    if (!this.encomendaId || !this.novoPagamento.valor || this.novoPagamento.valor <= 0) {
      this.mostrarNotificacao('Indique um valor válido.', 'error');
      return;
    }

    this.aGuardarPagamento = true;
    const payload = {
      encomenda: { numeroEncomenda: this.encomendaId },
      valor: this.novoPagamento.valor,
      dataPagamento: this.novoPagamento.dataPagamento || undefined,
      referencia: this.novoPagamento.referencia?.trim() || undefined,
      observacoes: this.novoPagamento.observacoes?.trim() || undefined,
      metodoPagamento: this.novoPagamento.metodoPagamento || undefined,
      verificationStatus: this.novoPagamento.aguardaExtrato ? ('PENDING_BANK' as const) : ('CONFIRMED' as const)
    };

    this.pagamentoService.criar(payload).subscribe({
      next: () => {
        this.aGuardarPagamento = false;
        this.novoPagamento = {
          valor: null,
          dataPagamento: new Date().toISOString().split('T')[0],
          referencia: '',
          metodoPagamento: '',
          observacoes: '',
          aguardaExtrato: false
        };
        this.mostrarNotificacao(
          payload.verificationStatus === 'PENDING_BANK'
            ? 'Pagamento registado. Confirme no extrato quando verificar o valor.'
            : 'Pagamento registado e contabilizado na dívida.',
          'success'
        );
        this.carregarTudo();
      },
      error: (err: unknown) => {
        this.aGuardarPagamento = false;
        const msg =
          err && typeof err === 'object' && 'error' in err
            ? (err as { error?: { error?: string } }).error?.error
            : null;
        this.mostrarNotificacao(msg || 'Erro ao registar pagamento.', 'error');
      }
    });
  }

  confirmarNoExtrato(p: PagamentoResponse): void {
    this.confirmandoId = p.id;
    this.pagamentoService.confirmarConciliacao(p.id).subscribe({
      next: () => {
        this.confirmandoId = null;
        this.mostrarNotificacao('Pagamento confirmado. Valor contabilizado na dívida.', 'success');
        this.carregarTudo();
      },
      error: (err: unknown) => {
        this.confirmandoId = null;
        const msg =
          err && typeof err === 'object' && 'error' in err
            ? (err as { error?: { error?: string } }).error?.error
            : null;
        this.mostrarNotificacao(msg || 'Erro ao confirmar.', 'error');
      }
    });
  }

  private mostrarNotificacao(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
  }

  labelVerificacao(status: string): string {
    return status === 'PENDING_BANK' ? 'Aguarda extrato' : 'Confirmado';
  }

  badgeVerificacao(status: string): string {
    return status === 'PENDING_BANK' ? 'badge-warning' : 'badge-success';
  }

  formatarData(data: string): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatarNumero(numero: number): string {
    return `VML-${String(numero).padStart(4, '0')}`;
  }

  formatarStatus(status: string): string {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'PAID' || statusUpper === 'PAGO') return 'PAGO';
    if (statusUpper === 'PARTIAL' || statusUpper === 'PARCIAL') return 'PARCIAL';
    if (statusUpper === 'UNPAID' || statusUpper === 'NAO_PAGO' || statusUpper === 'NÃO PAGO') return 'NÃO PAGO';
    return status;
  }

  getStatusClass(status: string): string {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'PAID' || statusUpper === 'PAGO') return 'badge-success';
    if (statusUpper === 'PARTIAL' || statusUpper === 'PARCIAL') return 'badge-warning';
    return 'badge-danger';
  }

  formatarFactura(encomenda: EncomendaResponse): string {
    return encomenda.invoiceNumber?.trim() || '—';
  }

  formatarDataFactura(encomenda: EncomendaResponse): string {
    if (!encomenda.invoiceDate) return '—';
    return this.formatarData(encomenda.invoiceDate);
  }

  editar() {
    if (this.encomendaId) {
      this.router.navigate(['/billing/encomendas', this.encomendaId, 'editar']);
    }
  }
}
