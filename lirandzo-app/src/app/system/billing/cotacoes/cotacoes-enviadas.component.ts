import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { CotacaoService, CotacaoResponse } from '../../../services/cotacao.service';
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
  /** E-mail do contacto (mostrado na célula se não houver telefone). */
  email?: string;
  origem: string;
  destino: string;
  descricaoCarga: string;
  dataEntrada: string;
  horaEntrada: string;
  /** Timestamp da criação (para ordenação). */
  dataCriacaoMs: number;
  estado: string;
  operador: string;
  formaEnvio: string;
  formaEnvioRaw: string;
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

  pageTitle = 'Negociação e ajuste';
  pageSubtitle = 'Negocie e ajuste preços; em seguida facture após aceitação do contacto';
  helpTitle = 'Fluxo comercial';
  helpItems: string[] = [
    'Quem pede cotação é um contacto — só passa a «cliente» no sentido de facturação quando existe documento (encomenda/factura).',
    '«Proposta pronta»: ainda pode ajustar valores no ecrã de gerar cotação antes de o contacto aceitar.',
    '«Registar aceitação»: use quando o contacto confirmou a proposta (telefone, WhatsApp, e-mail). Depois vá a Facturas → Facturas pendentes para emitir o documento.',
    'Com «Todos», a tabela ordena por estado: propostas prontas no topo; aceites e facturadas vão abaixo (dentro de cada grupo, use a seta em «Entrada» para a data).',
    'No rodapé: primeira/última página, anterior/seguinte, indicador numérico (página / total) e linhas por página.',
    'As cotações expiram automaticamente após a validade definida no sistema.'
  ];

  highlightId: number | null = null;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  private readonly STATUS_RESPONDIDO_BACKEND = 'RESPONDED';
  private readonly STATUS_CANCELLED_BACKEND = 'CANCELLED';

  /** Ordenação da coluna Entrada: mais recentes primeiro (desc) ou mais antigas primeiro (asc). */
  ordenacaoData: 'desc' | 'asc' = 'desc';

  /** Paginação: linhas por página (valores fixos). */
  readonly opcoesLinhasPorPagina = [50, 100, 300, 700, 1000] as const;
  linhasPorPaginaSelecionadas = 50;

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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.data, this.route.queryParams]).subscribe(([data, params]) => {
      const pathFacturacao = this.route.snapshot.routeConfig?.path === 'cotacoes/para-facturar';
      this.modoParaFacturar = !!data['cotacaoModoParaFacturar'] || pathFacturacao;
      const raw = params['highlightId'];
      this.highlightId = raw ? Number(raw) : null;

      this.aplicarTextosCabecalho();

      if (this.modoParaFacturar) {
        this.filtroEstado = 'TODOS';
        this.filtro = '';
      } else if (this.highlightId) {
        this.filtroEstado = ESTADO_PROPOSTA_PRONTA;
      }

      this.carregarCotacoes();
    });
  }

  private aplicarTextosCabecalho(): void {
    if (this.modoParaFacturar) {
      this.pageTitle = 'Facturas pendentes';
      this.pageSubtitle = 'Fila de cotações aceites pelo cliente — ainda sem factura. Use «Emitir factura» em cada linha.';
      this.helpTitle = 'Guia — facturas pendentes';
      this.helpItems = [
        'Só entram aqui cotações com aceitação registada e que ainda não foram facturadas (desaparecem da lista após emitir).',
        'Se precisar de ajustar preços, vá a Cotações → Negociação e ajuste, «Ajustar proposta», e registe de novo a aceitação se necessário.',
        '«Emitir factura» abre o ecrã de nova factura com os dados da cotação; revise, complete e finalize — a encomenda só é criada ao confirmar.',
        'No rodapé: primeira e última página, página a página, números da página e linhas por página.'
      ];
    } else {
      this.pageTitle = 'Negociação e ajuste';
      this.pageSubtitle = 'Negocie e ajuste preços; em seguida facture após aceitação do contacto';
      this.helpTitle = 'Fluxo comercial';
      this.helpItems = [
        'Quem pede cotação é um contacto — só passa a «cliente» no sentido de facturação quando existe documento (encomenda/factura).',
        '«Proposta pronta»: ainda pode ajustar valores no ecrã de gerar cotação antes de o contacto aceitar.',
        '«Registar aceitação»: use quando o contacto confirmou a proposta. A factura emite-se em Facturas → Facturas pendentes.',
        'Com «Todos», propostas prontas aparecem primeiro; aceites e facturadas listam-se abaixo. Paginação no rodapé com números e primeira/última página.',
        'As cotações expiram automaticamente após a validade definida no sistema.'
      ];
    }
  }

  carregarCotacoes(): void {
    this.loading = true;
    this.error = null;

    this.cotacaoService.listarCotacoes().subscribe({
      next: (cotacoes: CotacaoResponse[]) => {
        let enviadas: CotacaoResponse[];
        if (this.modoParaFacturar) {
          // Fila: só aceites ainda por facturar (INVOICED não entra)
          enviadas = cotacoes.filter((c) => {
            const statusUpper = (c.status || '').toUpperCase();
            return statusUpper === 'RESPONDED' || statusUpper === 'RESPONDIDO';
          });
        } else {
          enviadas = cotacoes.filter((c) => {
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
        }
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

    const statusUpper = (c.status || '').toUpperCase();
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
      email: email || undefined,
      origem: c.origem || '',
      destino: c.destino || '',
      descricaoCarga: c.descricaoCarga || '',
      dataEntrada,
      horaEntrada,
      dataCriacaoMs: dataCriacaoObj ? dataCriacaoObj.getTime() : 0,
      estado,
      operador: c.operador || '',
      formaEnvio,
      formaEnvioRaw
    };
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
    if (!this.modoParaFacturar && this.filtroEstado !== 'TODOS') {
      lista = lista.filter((c) => c.estado === this.filtroEstado);
    }
    if (!this.modoParaFacturar && this.filtro.trim()) {
      const f = this.filtro.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.cliente.toLowerCase().includes(f) ||
          c.ref.toLowerCase().includes(f) ||
          c.destino.toLowerCase().includes(f) ||
          c.descricaoCarga.toLowerCase().includes(f) ||
          c.formaEnvio.toLowerCase().includes(f) ||
          (c.telefone || '').toLowerCase().includes(f) ||
          (c.email || '').toLowerCase().includes(f)
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

  get totalPaginas(): number {
    const n = this.cotacoesFiltradas.length;
    const size = this.linhasPorPaginaSelecionadas;
    return Math.max(1, Math.ceil(n / size));
  }

  /** Página corrigida quando o filtro reduz o número de páginas. */
  get paginaCorrenteSegura(): number {
    return Math.min(Math.max(1, this.currentPage), this.totalPaginas);
  }

  get cotacoesPagina(): CotacaoEnviadaDisplay[] {
    const all = this.cotacoesFiltradas;
    const size = this.linhasPorPaginaSelecionadas;
    const page = this.paginaCorrenteSegura;
    const start = (page - 1) * size;
    return all.slice(start, start + size);
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

  paginaPrimeira(): void {
    this.currentPage = 1;
  }

  paginaUltima(): void {
    this.currentPage = this.totalPaginas;
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
    const aceite = (estado || '').trim() === ESTADO_ACEITE_CLIENTE;
    return this.modoParaFacturar && aceite;
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
              'Aceitação pelo cliente registada. Pode emitir a factura em Facturas → Facturas pendentes.',
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
