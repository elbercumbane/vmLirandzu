import { Component, OnInit } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { EncomendaService, EncomendaResponse } from '../../../services/encomenda.service';
import { PagamentoService, PagamentoResponse, VerificationStatusApi } from '../../../services/pagamento.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';
import { AuthService } from '../../../shared/services/auth.service';

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
  /** Aprovação / recusa de pagamento PENDING_APPROVAL (gestor/admin) */
  processandoAprovacaoId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private encomendaService: EncomendaService,
    private pagamentoService: PagamentoService,
    private auth: AuthService
  ) {}

  get podeAprovarPagamentos(): boolean {
    return this.auth.isAdmin || this.auth.isGestor;
  }

  get podeEditarFactura(): boolean {
    return this.auth.canEditFacturas();
  }

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

  get valorPendenteAprovacao(): number {
    return this.pagamentos
      .filter((p) => p.verificationStatus === 'PENDING_APPROVAL')
      .reduce((s, p) => s + (p.valor || 0), 0);
  }

  registarPagamento(): void {
    if (!this.encomendaId || !this.novoPagamento.valor || this.novoPagamento.valor <= 0) {
      this.mostrarNotificacao('Indique um valor válido.', 'error');
      return;
    }

    this.aGuardarPagamento = true;
    let verificationStatus: VerificationStatusApi;
    if (this.novoPagamento.aguardaExtrato) {
      verificationStatus = 'PENDING_BANK';
    } else if (this.auth.isAdmin || this.auth.isGestor) {
      verificationStatus = 'CONFIRMED';
    } else {
      verificationStatus = 'PENDING_APPROVAL';
    }

    const payload = {
      encomenda: { numeroEncomenda: this.encomendaId },
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
        this.novoPagamento = {
          valor: null,
          dataPagamento: new Date().toISOString().split('T')[0],
          referencia: '',
          metodoPagamento: '',
          observacoes: '',
          aguardaExtrato: false
        };
        let msg = 'Pagamento registado.';
        if (payload.verificationStatus === 'PENDING_BANK') {
          msg = 'Pagamento registado. Confirme no extrato quando verificar o valor.';
        } else if (payload.verificationStatus === 'PENDING_APPROVAL') {
          msg =
            'Pedido de pagamento enviado. Um gestor ou administrador deve aprovar antes de contabilizar na dívida.';
        } else {
          msg = 'Pagamento registado e contabilizado na dívida.';
        }
        this.mostrarNotificacao(msg, 'success');
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

  aprovarPagamentoGestor(p: PagamentoResponse): void {
    this.processandoAprovacaoId = p.id;
    this.pagamentoService.aprovarPagamentoGestor(p.id).subscribe({
      next: () => {
        this.processandoAprovacaoId = null;
        this.mostrarNotificacao('Pagamento aprovado e contabilizado na dívida.', 'success');
        this.carregarTudo();
      },
      error: (err: unknown) => {
        this.processandoAprovacaoId = null;
        const msg =
          err && typeof err === 'object' && 'error' in err
            ? (err as { error?: { error?: string } }).error?.error
            : null;
        this.mostrarNotificacao(msg || 'Erro ao aprovar.', 'error');
      }
    });
  }

  recusarPagamentoGestor(p: PagamentoResponse): void {
    const motivo = typeof window !== 'undefined' ? window.prompt('Motivo da recusa:', '') : null;
    if (motivo === null) return;
    const trimmed = (motivo || '').trim();
    if (!trimmed) {
      this.mostrarNotificacao('Indique um motivo para recusar.', 'error');
      return;
    }
    this.processandoAprovacaoId = p.id;
    this.pagamentoService.recusarPagamentoGestor(p.id, trimmed).subscribe({
      next: () => {
        this.processandoAprovacaoId = null;
        this.mostrarNotificacao('Pagamento recusado.', 'success');
        this.carregarTudo();
      },
      error: (err: unknown) => {
        this.processandoAprovacaoId = null;
        const msg =
          err && typeof err === 'object' && 'error' in err
            ? (err as { error?: { error?: string } }).error?.error
            : null;
        this.mostrarNotificacao(msg || 'Erro ao recusar.', 'error');
      }
    });
  }

  private mostrarNotificacao(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
  }

  labelVerificacao(status: string): string {
    switch (status) {
      case 'PENDING_BANK':
        return 'Aguarda extrato';
      case 'PENDING_APPROVAL':
        return 'Aguarda aprovação';
      case 'REJECTED':
        return 'Recusado';
      case 'CONFIRMED':
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
      case 'CONFIRMED':
      default:
        return 'badge-success';
    }
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

  showPdfPreview = false;

  abrirPdfPreview(): void {
    this.showPdfPreview = true;
  }

  fecharPdfPreview(): void {
    this.showPdfPreview = false;
  }

  async guardarPdfFactura(): Promise<void> {
    const element = document.getElementById('factura-pdf-content');
    if (!element) {
      this.mostrarNotificacao('Erro ao gerar PDF: conteúdo não encontrado.', 'error');
      return;
    }
    const enc = this.encomenda!;
    const filename = `fatura_${enc.invoiceNumber || enc.numeroEncomenda}_${enc.cliente?.nome?.replace(/\s+/g, '_') || 'cliente'}.pdf`;
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['css', 'legacy'] as ('css' | 'legacy')[] }
    };
    try {
      await html2pdf().set(opt).from(element).save();
      this.mostrarNotificacao('PDF gerado com sucesso!', 'success');
      this.fecharPdfPreview();
    } catch (e) {
      this.mostrarNotificacao('Erro ao gerar PDF. Tente novamente.', 'error');
    }
  }

  /** Converte o produto salvo no formato "1x desc [PRECO:xxx]" em lista de itens. */
  getProdutoItens(): { quantidade: number; descricao: string; precoUnitario: number | null }[] {
    const produto = this.encomenda?.produto || '';
    const valorTotal = this.encomenda?.valorTotal || null;
    if (!produto) return [];
    const precoRegex = /\[PRECO:([\d.]+)\]/;
    const qtdRegex = /^(\d+)x\s+/;
    const linhas = produto.includes('\n') ? produto.split('\n') : produto.split(/,(?![^\[]*\])/);
    const itens = linhas.map(l => l.trim()).filter(l => l).map(linha => {
      const precoMatch = linha.match(precoRegex);
      const preco = precoMatch ? parseFloat(precoMatch[1]) : null;
      const semPreco = linha.replace(precoRegex, '').trim();
      const qtdMatch = semPreco.match(qtdRegex);
      const qtd = qtdMatch ? parseInt(qtdMatch[1]) : 1;
      const desc = semPreco.replace(qtdRegex, '').trim();
      return { quantidade: qtd, descricao: desc, precoUnitario: preco };
    });
    if (itens.length > 0 && itens.every(i => i.precoUnitario == null) && valorTotal) {
      itens[0].precoUnitario = valorTotal;
    }
    return itens.length > 0 ? itens : [{ quantidade: 1, descricao: produto, precoUnitario: valorTotal }];
  }

  getTotalItens(): number {
    return this.getProdutoItens().reduce((s, i) => s + i.quantidade * (i.precoUnitario || 0), 0);
  }
}
