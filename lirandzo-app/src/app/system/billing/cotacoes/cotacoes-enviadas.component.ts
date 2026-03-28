import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { CotacaoService, CotacaoResponse } from '../../../services/cotacao.service';
import { EncomendaService, EmitirFacturaResponse } from '../../../services/encomenda.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';
import { CotacaoPreviewModalComponent } from './cotacao-preview-modal.component';

/** Estados apresentados na UI (mapeados a partir do backend). */
export const ESTADO_PROPOSTA_PRONTA = 'PROPOSTA PRONTA';
export const ESTADO_ACEITE_CLIENTE = 'Aceite pelo cliente';
export const ESTADO_FACTURADA = 'FACTURADA';
export const ESTADO_CANCELADA = 'CANCELADA';

interface CotacaoEnviadaDisplay {
  id: number;
  ref: string;
  cliente: string;
  contacto: string;
  telefone: string;
  origem: string;
  destino: string;
  descricaoCarga: string;
  dataEntrada: string;
  horaEntrada: string;
  /** Timestamp da criação (para ordenação). */
  dataCriacaoMs: number;
  estado: string;
  operador: string;
  dataResposta: string;
  tempoResposta: string;
  formaEnvio: string;
  formaEnvioRaw: string;
  ajusteInfo?: string;
}

@Component({
  selector: 'app-cotacoes-enviadas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BillingSectionHeaderComponent, NotificationPopupComponent, CotacaoPreviewModalComponent],
  templateUrl: './cotacoes-enviadas.component.html',
  styleUrls: ['../shared/billing-page.css', './cotacoes-enviadas.component.css']
})
export class CotacoesEnviadasComponent implements OnInit {
  filtro = '';
  filtroEstado = 'TODOS';
  cotacoes: CotacaoEnviadaDisplay[] = [];
  loading = true;
  error: string | null = null;

  /** Rota `/billing/cotacoes/para-facturar`: só emissão de factura, sem duplicar lógica de comercial. */
  modoParaFacturar = false;

  pageTitle = 'Cotações em negociação & ajuste';
  pageSubtitle = 'Negocie e ajuste preços; em seguida facture após aceitação do contacto';
  helpTitle = 'Fluxo comercial';
  helpItems: string[] = [
    'Quem pede cotação é um contacto — só passa a «cliente» no sentido de facturação quando existe documento (encomenda/factura).',
    '«Proposta pronta»: ainda pode ajustar valores no ecrã de gerar cotação antes de o contacto aceitar.',
    '«Registar aceitação»: use quando o contacto confirmou a proposta (telefone, WhatsApp, e-mail). Depois vá a Facturação → Cotações para facturar.',
    'Com «Todos», a tabela ordena por estado: propostas prontas no topo; aceites e facturadas vão abaixo (dentro de cada grupo, use a seta em «Entrada» para a data).',
    'Use «Filtrar por estado» e a paginação no rodapé da tabela para navegar muitas linhas.',
    'As cotações expiram automaticamente após a validade definida no sistema.'
  ];

  highlightId: number | null = null;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  private readonly STATUS_RESPONDIDO_BACKEND = 'RESPONDED';
  private readonly STATUS_CANCELLED_BACKEND = 'CANCELLED';

  emitindoCotacaoId: number | null = null;

  /** Ordenação da coluna Entrada: mais recentes primeiro (desc) ou mais antigas primeiro (asc). */
  ordenacaoData: 'desc' | 'asc' = 'desc';

  /** Paginação: padrão 500 linhas; opcionalmente sobrepõe-se com `manualLinhasPorPagina`. */
  readonly opcoesLinhasPorPagina = [10, 20, 50, 100, 200, 500, 5000] as const;
  linhasPorPaginaSelecionadas = 500;
  /** Valor opcional digitado pelo utilizador (1–10000); se válido, tem prioridade sobre a lista. */
  manualLinhasPorPagina = '';

  currentPage = 1;

  /** Modal de pré-visualização na mesma página (evita novo separador / perda de sessão). */
  previewModalCotacaoId: number | null = null;

  readonly estados = {
    propostaPronta: ESTADO_PROPOSTA_PRONTA,
    aceite: ESTADO_ACEITE_CLIENTE,
    facturada: ESTADO_FACTURADA,
    cancelada: ESTADO_CANCELADA
  };

  constructor(
    private cotacaoService: CotacaoService,
    private encomendaService: EncomendaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.data, this.route.queryParams]).subscribe(([data, params]) => {
      this.modoParaFacturar = !!data['cotacaoModoParaFacturar'];
      const raw = params['highlightId'];
      this.highlightId = raw ? Number(raw) : null;

      this.aplicarTextosCabecalho();

      if (this.modoParaFacturar) {
        this.filtroEstado = ESTADO_ACEITE_CLIENTE;
      } else if (this.highlightId) {
        this.filtroEstado = ESTADO_PROPOSTA_PRONTA;
      }

      this.carregarCotacoes();
    });
  }

  private aplicarTextosCabecalho(): void {
    if (this.modoParaFacturar) {
      this.pageTitle = 'Cotações para facturar';
      this.pageSubtitle = 'Apenas propostas já aceites pelo cliente — emita a factura aqui';
      this.helpTitle = 'Facturação a partir da cotação';
      this.helpItems = [
        'Só aparecem linhas com aceitação registada (estado «Aceite pelo cliente»).',
        'Se ainda precisa de ajustar preços, volte ao menu Comercial → Cotações enviadas, abra «Ajustar proposta» e só depois registe de novo a aceitação.',
        'Emitir factura cria a encomenda e liga à cotação; aí sim o contacto entra no circuito de cliente facturado.',
        'No rodapé da tabela pode alterar quantas linhas vê por página (incluindo valor manual opcional).'
      ];
    } else {
      this.pageTitle = 'Cotações em negociação & ajuste';
      this.pageSubtitle = 'Negocie e ajuste preços; em seguida facture após aceitação do contacto';
      this.helpTitle = 'Fluxo comercial';
      this.helpItems = [
        'Quem pede cotação é um contacto — só passa a «cliente» no sentido de facturação quando existe documento (encomenda/factura).',
        '«Proposta pronta»: ainda pode ajustar valores no ecrã de gerar cotação antes de o contacto aceitar.',
        '«Registar aceitação»: use quando o contacto confirmou a proposta. A factura emite-se em Facturação → Cotações para facturar.',
        'Com «Todos», propostas prontas aparecem primeiro; aceites e facturadas listam-se abaixo. Paginação no rodapé da tabela.',
        'As cotações expiram automaticamente após a validade definida no sistema.'
      ];
    }
  }

  carregarCotacoes(): void {
    this.loading = true;
    this.error = null;

    this.cotacaoService.listarCotacoes().subscribe({
      next: (cotacoes: CotacaoResponse[]) => {
        const enviadas = cotacoes.filter((c) => {
          const statusUpper = (c.status || '').toUpperCase();
          return (
            statusUpper === 'QUOTATION_GENERATED' ||
            statusUpper === 'COTACAO_GERADA' ||
            statusUpper === 'COTACAO GERADA' ||
            statusUpper === 'RESPONDED' ||
            statusUpper === 'RESPONDIDO' ||
            statusUpper === 'INVOICED' ||
            statusUpper === 'FACTURADA' ||
            statusUpper === 'CANCELLED' ||
            statusUpper === 'CANCELADA'
          );
        });
        this.cotacoes = enviadas.map((c) => this.mapearCotacao(c));
        this.currentPage = 1;
        this.loading = false;
        setTimeout(() => this.destaquearLinha(), 50);
      },
      error: () => {
        this.error = 'Erro ao carregar cotações da base de dados';
        this.loading = false;
        this.cotacoes = [];
      }
    });
  }

  private destaquearLinha(): void {
    if (!this.highlightId) return;
    const row = document.querySelector(`[data-cotacao-id="${this.highlightId}"]`) as HTMLElement | null;
    if (!row) return;
    row.classList.add('cotacao-highlight');
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private mapearCotacao(c: CotacaoResponse): CotacaoEnviadaDisplay {
    const clienteNome = c.cliente?.nome || 'Contacto não especificado';
    const telefone = c.cliente?.telefone || '';
    const email = c.cliente?.email || '';
    const contacto = telefone || email || '';

    const dataCriacaoObj = c.dataCriacao ? new Date(c.dataCriacao) : null;
    const dataEntrada = dataCriacaoObj
      ? dataCriacaoObj.toLocaleDateString('pt-MZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : '';
    const horaEntrada = dataCriacaoObj
      ? dataCriacaoObj.toLocaleTimeString('pt-MZ', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    const dataResposta = c.dataResposta
      ? new Date(c.dataResposta).toLocaleString('pt-MZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    const statusUpper = (c.status || '').toUpperCase();
    let tempoResposta = '—';
    if (c.dataCriacao && c.dataResposta) {
      const isAceite = statusUpper === 'RESPONDED' || statusUpper === 'RESPONDIDO';
      if (isAceite) {
        const inicioMs = new Date(c.dataCriacao).getTime();
        const fimMs = new Date(c.dataResposta).getTime();
        const diffMs = fimMs - inicioMs;
        tempoResposta = diffMs >= 0 ? this.formatarDuracao(diffMs) : '—';
      }
    }
    const statusMap: { [key: string]: string } = {
      RESPONDED: ESTADO_ACEITE_CLIENTE,
      RESPONDIDO: ESTADO_ACEITE_CLIENTE,
      QUOTATION_GENERATED: ESTADO_PROPOSTA_PRONTA,
      COTACAO_GERADA: ESTADO_PROPOSTA_PRONTA,
      'COTACAO GERADA': ESTADO_PROPOSTA_PRONTA,
      INVOICED: ESTADO_FACTURADA,
      FACTURADA: ESTADO_FACTURADA,
      CANCELLED: ESTADO_CANCELADA,
      CANCELADA: ESTADO_CANCELADA
    };
    const estado = statusMap[statusUpper] || ESTADO_ACEITE_CLIENTE;

    const formaEnvioMap: { [key: string]: string } = {
      whatsapp: 'WhatsApp',
      email: 'E-mail',
      pdf: 'PDF / Impressão',
      chamada: 'Chamada Telefónica'
    };
    const formaEnvio = c.formaEnvioRealizada
      ? formaEnvioMap[c.formaEnvioRealizada.toLowerCase()] || c.formaEnvioRealizada
      : c.formaEnvioPreferida
        ? formaEnvioMap[c.formaEnvioPreferida.toLowerCase()] || c.formaEnvioPreferida
        : '—';

    const formaEnvioRaw = c.formaEnvioRealizada
      ? c.formaEnvioRealizada
      : c.formaEnvioPreferida
        ? c.formaEnvioPreferida
        : '';

    const condicoesUpper = (c.condicoes || '').toUpperCase();
    const ajusteInfo =
      condicoesUpper.includes('AJUSTE_APOS_ACEITE')
        ? 'Ajuste após aceitação'
        : condicoesUpper.includes('AJUSTE_PRECO')
          ? 'Ajuste de preço'
          : undefined;

    return {
      id: c.id,
      ref: c.referencia || `COT-${new Date().getFullYear()}-${String(c.id).padStart(3, '0')}`,
      cliente: clienteNome,
      contacto,
      telefone,
      origem: c.origem || '',
      destino: c.destino || '',
      descricaoCarga: c.descricaoCarga || '',
      dataEntrada,
      horaEntrada,
      dataCriacaoMs: dataCriacaoObj ? dataCriacaoObj.getTime() : 0,
      estado,
      operador: c.operador || '',
      dataResposta,
      tempoResposta: tempoResposta || '—',
      formaEnvio,
      formaEnvioRaw,
      ajusteInfo
    };
  }

  private formatarDuracao(diffMs: number): string {
    const totalSeconds = Math.floor(diffMs / 1000);
    if (totalSeconds <= 0) return '—';

    const dias = Math.floor(totalSeconds / 86400);
    const horas = Math.floor((totalSeconds % 86400) / 3600);
    const minutos = Math.floor((totalSeconds % 3600) / 60);
    const segundos = totalSeconds % 60;

    const pluralDia = dias === 1 ? 'dia' : 'dias';
    const pluralMin = minutos === 1 ? 'minuto' : 'minutos';

    if (dias > 0) {
      const partes: string[] = [`${dias} ${pluralDia}`];
      if (horas > 0) partes.push(`${horas}h`);
      if (minutos > 0) partes.push(`${minutos} ${pluralMin}`);
      partes.push(`${segundos}s`);
      return partes.join(' e ');
    }

    const mm = String(minutos).padStart(2, '0');
    return `${horas}h:${mm} e ${segundos}s`;
  }

  /**
   * Ordem na lista (ex.: «Todos»): pendentes de aceitação primeiro; aceites e concluídos descem.
   * Dentro do mesmo estado mantém-se a ordenação por data de entrada.
   */
  private prioridadeEstadoParaLista(estado: string): number {
    switch (estado) {
      case ESTADO_PROPOSTA_PRONTA:
        return 0;
      case ESTADO_ACEITE_CLIENTE:
        return 1;
      case ESTADO_FACTURADA:
        return 2;
      case ESTADO_CANCELADA:
        return 3;
      default:
        return 9;
    }
  }

  get cotacoesFiltradas(): CotacaoEnviadaDisplay[] {
    let lista = this.cotacoes;
    if (this.filtroEstado !== 'TODOS') {
      lista = lista.filter((c) => c.estado === this.filtroEstado);
    }
    if (this.filtro.trim()) {
      const f = this.filtro.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.cliente.toLowerCase().includes(f) ||
          c.ref.toLowerCase().includes(f) ||
          c.destino.toLowerCase().includes(f) ||
          c.descricaoCarga.toLowerCase().includes(f) ||
          c.formaEnvio.toLowerCase().includes(f)
      );
    }
    const porEstadoEData = (a: CotacaoEnviadaDisplay, b: CotacaoEnviadaDisplay) => {
      const pa = this.prioridadeEstadoParaLista(a.estado);
      const pb = this.prioridadeEstadoParaLista(b.estado);
      if (pa !== pb) return pa - pb;
      const cmp = a.dataCriacaoMs - b.dataCriacaoMs;
      return this.ordenacaoData === 'desc' ? -cmp : cmp;
    };
    return [...lista].sort(porEstadoEData);
  }

  /** Linhas por página efectivas (manual válido sobrepõe o select). */
  get linhasPorPaginaEfectivas(): number {
    const raw = this.manualLinhasPorPagina?.trim();
    if (raw) {
      const n = Number.parseInt(raw, 10);
      if (Number.isFinite(n) && n >= 1 && n <= 10000) return n;
    }
    return this.linhasPorPaginaSelecionadas;
  }

  get totalPaginas(): number {
    const n = this.cotacoesFiltradas.length;
    const size = this.linhasPorPaginaEfectivas;
    return Math.max(1, Math.ceil(n / size));
  }

  /** Página corrigida quando o filtro reduz o número de páginas. */
  get paginaCorrenteSegura(): number {
    return Math.min(Math.max(1, this.currentPage), this.totalPaginas);
  }

  get cotacoesPagina(): CotacaoEnviadaDisplay[] {
    const all = this.cotacoesFiltradas;
    const size = this.linhasPorPaginaEfectivas;
    const page = this.paginaCorrenteSegura;
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  }

  get intervaloPaginaTexto(): string {
    const all = this.cotacoesFiltradas.length;
    if (all === 0) return '0 de 0';
    const size = this.linhasPorPaginaEfectivas;
    const page = this.paginaCorrenteSegura;
    const from = (page - 1) * size + 1;
    const to = Math.min(page * size, all);
    return `${from}–${to} de ${all}`;
  }

  definirFiltroEstado(valor: string): void {
    this.filtroEstado = valor;
    this.currentPage = 1;
  }

  aoAlterarPesquisa(): void {
    this.currentPage = 1;
  }

  aoAlterarLinhasPorPagina(): void {
    this.currentPage = 1;
  }

  aplicarManualLinhasPorPagina(): void {
    this.currentPage = 1;
  }

  paginaAnterior(): void {
    this.currentPage = Math.max(1, this.paginaCorrenteSegura - 1);
  }

  paginaSeguinte(): void {
    this.currentPage = Math.min(this.totalPaginas, this.paginaCorrenteSegura + 1);
  }

  alternarOrdenacaoEntrada(): void {
    this.ordenacaoData = this.ordenacaoData === 'desc' ? 'asc' : 'desc';
  }

  get totalPropostasProntas(): number {
    return this.cotacoes.filter((c) => c.estado === ESTADO_PROPOSTA_PRONTA).length;
  }

  get totalAceitesFacturaveis(): number {
    return this.cotacoes.filter((c) => c.estado === ESTADO_ACEITE_CLIENTE).length;
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case ESTADO_PROPOSTA_PRONTA:
        return 'badge badge-warning';
      case ESTADO_ACEITE_CLIENTE:
        return 'badge badge-info';
      case ESTADO_FACTURADA:
        return 'badge badge-success';
      case ESTADO_CANCELADA:
        return 'badge badge-danger';
      default:
        return 'badge badge-neutral';
    }
  }

  podeEmitirFactura(estado: string): boolean {
    return this.modoParaFacturar && estado === ESTADO_ACEITE_CLIENTE;
  }

  emitirFactura(c: CotacaoEnviadaDisplay): void {
    this.emitindoCotacaoId = c.id;
    this.encomendaService.emitirFacturaDeCotacao(c.id).subscribe({
      next: (enc: EmitirFacturaResponse) => {
        this.emitindoCotacaoId = null;
        const idEnc = enc?.numeroEncomenda;
        if (idEnc == null || Number.isNaN(Number(idEnc))) {
          this.mostrarNotificacao('Factura emitida. Abra a lista de encomendas para ver os detalhes.', 'success');
          this.carregarCotacoes();
          this.router.navigate(['/billing/encomendas']);
          return;
        }
        const ref = enc.invoiceNumber || `FAC-${idEnc}`;
        this.mostrarNotificacao(`Factura ${ref} emitida. A cotação foi marcada como facturada.`, 'success');
        this.carregarCotacoes();
        this.router.navigate(['/billing/encomendas', idEnc]);
      },
      error: (err: unknown) => {
        this.emitindoCotacaoId = null;
        const body =
          err && typeof err === 'object' && 'error' in err ? (err as { error?: { error?: string } }).error : undefined;
        const msg = body?.error || 'Não foi possível emitir a factura.';
        this.mostrarNotificacao(msg, 'error');
      }
    });
  }

  abrirPrevisualizar(c: CotacaoEnviadaDisplay): void {
    this.previewModalCotacaoId = c.id;
  }

  fecharPrevisualizar(): void {
    this.previewModalCotacaoId = null;
  }

  registarAceitacaoCliente(c: CotacaoEnviadaDisplay): void {
    this.cotacaoService.obterCotacao(c.id).subscribe({
      next: (cotacao: CotacaoResponse) => {
        if (!cotacao.cliente?.id) {
          this.error = 'Dados do contacto inválidos na cotação';
          return;
        }

        const formaEnvioRealizadaRaw =
          cotacao.formaEnvioPreferida || cotacao.formaEnvioRealizada || c.formaEnvioRaw || 'pdf';

        const payload = {
          cliente: { id: cotacao.cliente.id },
          origem: cotacao.origem,
          destino: cotacao.destino,
          tipoVeiculo: cotacao.tipoVeiculo || undefined,
          descricaoCarga: cotacao.descricaoCarga || undefined,
          valorTotal: cotacao.valorTotal || undefined,
          custoTransporte: cotacao.custoTransporte || undefined,
          custoRecolha: cotacao.custoRecolha || undefined,
          custoBillOfEntry: cotacao.custoBillOfEntry || undefined,
          dataCotacao: cotacao.dataCotacao,
          dataValidade: cotacao.dataValidade || undefined,
          status: this.STATUS_RESPONDIDO_BACKEND,
          observacoes: cotacao.observacoes || undefined,
          condicoes: cotacao.condicoes || undefined,
          operador: cotacao.operador || undefined,
          formaEnvioPreferida: cotacao.formaEnvioPreferida || undefined,
          formaEnvioRealizada: formaEnvioRealizadaRaw
        };

        this.cotacaoService.atualizarCotacao(c.id, payload).subscribe({
          next: () => {
            this.filtroEstado = 'TODOS';
            this.carregarCotacoes();
            this.mostrarNotificacao(
              'Aceitação pelo cliente registada. Pode emitir a factura em Facturação → Cotações para facturar.',
              'success'
            );
          },
          error: () => {
            this.error = 'Erro ao registar aceitação';
            this.mostrarNotificacao('Erro ao registar aceitação. Tente novamente.', 'error');
          }
        });
      },
      error: () => {
        this.error = 'Erro ao obter cotação';
        this.mostrarNotificacao('Erro ao obter cotação. Tente novamente.', 'error');
      }
    });
  }

  anularProposta(c: CotacaoEnviadaDisplay): void {
    const confirmar = window.confirm(
      `Anular a proposta ${c.ref}?\n\n` +
        'O contacto deixa de estar neste fluxo comercial (não será facturado por esta linha). Se premir «Não», a proposta mantém-se.'
    );
    if (!confirmar) return;

    this.cotacaoService.obterCotacao(c.id).subscribe({
      next: (cotacao: CotacaoResponse) => {
        if (!cotacao.cliente?.id) {
          this.error = 'Dados do contacto inválidos na cotação';
          return;
        }

        const payload = {
          cliente: { id: cotacao.cliente.id },
          origem: cotacao.origem,
          destino: cotacao.destino,
          tipoVeiculo: cotacao.tipoVeiculo || undefined,
          descricaoCarga: cotacao.descricaoCarga || undefined,
          valorTotal: cotacao.valorTotal || undefined,
          custoTransporte: cotacao.custoTransporte || undefined,
          custoRecolha: cotacao.custoRecolha || undefined,
          custoBillOfEntry: cotacao.custoBillOfEntry || undefined,
          dataCotacao: cotacao.dataCotacao,
          dataValidade: cotacao.dataValidade || undefined,
          status: this.STATUS_CANCELLED_BACKEND,
          observacoes: cotacao.observacoes || undefined,
          condicoes: cotacao.condicoes || undefined,
          operador: cotacao.operador || undefined,
          formaEnvioPreferida: cotacao.formaEnvioPreferida || undefined,
          formaEnvioRealizada: cotacao.formaEnvioRealizada || undefined
        };

        this.cotacaoService.atualizarCotacao(c.id, payload).subscribe({
          next: () => {
            this.filtroEstado = 'TODOS';
            this.carregarCotacoes();
            this.mostrarNotificacao('Proposta anulada.', 'success');
          },
          error: () => {
            this.error = 'Erro ao anular proposta';
            this.mostrarNotificacao('Erro ao anular proposta. Tente novamente.', 'error');
          }
        });
      },
      error: () => {
        this.error = 'Erro ao obter cotação';
        this.mostrarNotificacao('Erro ao obter cotação. Tente novamente.', 'error');
      }
    });
  }

  private mostrarNotificacao(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 7000);
  }
}
