import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { CotacaoService, CotacaoResponse } from '../../../services/cotacao.service';
import { NotificationPopupComponent } from '../../../shared/components/notification-popup/notification-popup.component';

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
  estado: string;
  operador: string;
  dataResposta: string;
  tempoResposta: string;
  formaEnvio: string;
  formaEnvioRaw: string;
}

@Component({
  selector: 'app-cotacoes-enviadas',
  standalone: true,
  imports: [CommonModule, FormsModule, BillingSectionHeaderComponent, NotificationPopupComponent],
  templateUrl: './cotacoes-enviadas.component.html',
  styleUrls: ['../shared/billing-page.css', './cotacoes-enviadas.component.css']
})
export class CotacoesEnviadasComponent implements OnInit {
  filtro = '';
  filtroEstado = 'TODOS';
  cotacoes: CotacaoEnviadaDisplay[] = [];
  loading = true;
  error: string | null = null;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  private readonly STATUS_RESPONDIDO_BACKEND = 'RESPONDED';
  private readonly STATUS_CANCELLED_BACKEND = 'CANCELLED';

  constructor(
    private cotacaoService: CotacaoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarCotacoes();
  }

  carregarCotacoes() {
    this.loading = true;
    this.error = null;

    this.cotacaoService.listarCotacoes().subscribe({
      next: (cotacoes: CotacaoResponse[]) => {
        console.log('Todas as cotações recebidas:', cotacoes);
        // Filtrar apenas cotações geradas e enviadas
        // No backend, o enum é QUOTATION_GENERATED.
        const enviadas = cotacoes.filter(c => {
          const statusUpper = (c.status || '').toUpperCase();
          return (
            statusUpper === 'QUOTATION_GENERATED' ||
            statusUpper === 'COTACAO_GERADA' ||
            statusUpper === 'COTACAO GERADA' ||
            statusUpper === 'RESPONDED' ||
            statusUpper === 'RESPONDIDO'
          );
        });
        console.log('Cotações enviadas filtradas:', enviadas);
        this.cotacoes = enviadas.map(c => this.mapearCotacao(c));
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar cotações:', error);
        this.error = 'Erro ao carregar cotações da base de dados';
        this.loading = false;
        this.cotacoes = [];
      }
    });
  }

  private mapearCotacao(c: CotacaoResponse): CotacaoEnviadaDisplay {
    const clienteNome = c.cliente?.nome || 'Cliente não especificado';
    const telefone = c.cliente?.telefone || '';
    const email = c.cliente?.email || '';
    const contacto = telefone || email || '';

    const dataCotacaoObj = c.dataCotacao ? new Date(c.dataCotacao) : null;
    const dataEntrada = dataCotacaoObj
      ? dataCotacaoObj.toLocaleDateString('pt-MZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : '';
    const horaEntrada = dataCotacaoObj
      ? dataCotacaoObj.toLocaleTimeString('pt-MZ', {
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
    if (c.dataCotacao) {
      const isRespondido = statusUpper === 'RESPONDED' || statusUpper === 'RESPONDIDO';
      // Para pedidos do portal, `dataCotacao` corresponde à data de registo do pedido.
      const inicioMs = new Date(c.dataCotacao).getTime();
      const fimMs = isRespondido && c.dataResposta ? new Date(c.dataResposta).getTime() : Date.now();
      const diffMs = fimMs - inicioMs;
      tempoResposta = diffMs >= 0 ? this.formatarDuracao(diffMs) : '—';
    }
    const statusMap: { [key: string]: string } = {
      'RESPONDED': 'RESPONDIDO',
      'RESPONDIDO': 'RESPONDIDO',
      'QUOTATION_GENERATED': 'COTAÇÃO GERADA',
      'COTACAO_GERADA': 'COTAÇÃO GERADA',
      'COTACAO GERADA': 'COTAÇÃO GERADA'
    };
    const estado = statusMap[statusUpper] || 'RESPONDIDO';

    const formaEnvioMap: { [key: string]: string } = {
      'whatsapp': 'WhatsApp',
      'email': 'E-mail',
      'pdf': 'PDF / Impressão',
      'chamada': 'Chamada Telefónica'
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
      estado,
      operador: c.operador || '',
      dataResposta,
      tempoResposta: tempoResposta || '—',
      formaEnvio,
      formaEnvioRaw
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
      // Ex: 2 dias e 20 minutos e 10s
      const partes: string[] = [`${dias} ${pluralDia}`];
      if (horas > 0) partes.push(`${horas}h`);
      if (minutos > 0) partes.push(`${minutos} ${pluralMin}`);
      partes.push(`${segundos}s`);
      return partes.join(' e ');
    }

    // Ex: 25h:20 e 30s
    const mm = String(minutos).padStart(2, '0');
    return `${horas}h:${mm} e ${segundos}s`;
  }

  get cotacoesFiltradas() {
    let lista = this.cotacoes;
    if (this.filtroEstado !== 'TODOS') {
      lista = lista.filter(c => c.estado === this.filtroEstado);
    }
    if (this.filtro.trim()) {
      const f = this.filtro.toLowerCase();
      lista = lista.filter(c =>
        c.cliente.toLowerCase().includes(f) ||
        c.ref.toLowerCase().includes(f) ||
        c.destino.toLowerCase().includes(f) ||
        c.descricaoCarga.toLowerCase().includes(f) ||
        c.formaEnvio.toLowerCase().includes(f)
      );
    }
    // Ordenar: "por enviar" (COTAÇÃO GERADA) sempre em cima
    return lista.sort((a, b) => {
      const ap = a.estado === 'COTAÇÃO GERADA' ? 0 : 1;
      const bp = b.estado === 'COTAÇÃO GERADA' ? 0 : 1;
      return ap - bp;
    });
  }

  get totalGerados() { return this.cotacoes.filter(c => c.estado === 'COTAÇÃO GERADA').length; }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'COTAÇÃO GERADA': return 'badge badge-success';
      default: return 'badge badge-success';
    }
  }

  baixarOuVerPdf(c: CotacaoEnviadaDisplay): void {
    // Gera o PDF novamente no componente de cotação
    // (sem alterar status) usando query param.
    this.router.navigate(['/billing/cotacoes/gerar', c.id], {
      queryParams: { pdfOnly: '1' }
    });
  }

  confirmarEnvio(c: CotacaoEnviadaDisplay): void {
    // Ao confirmar o envio (operador), a cotação passa para RESPONDED
    // para sair da lista de "geradas pendentes".
    this.cotacaoService.obterCotacao(c.id).subscribe({
      next: (cotacao: CotacaoResponse) => {
        if (!cotacao.cliente?.id) {
          this.error = 'Cliente inválido na cotação';
          return;
        }

        const formaEnvioRealizadaRaw =
          (cotacao.formaEnvioPreferida || cotacao.formaEnvioRealizada || c.formaEnvioRaw || 'pdf');

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
            this.carregarCotacoes();
            this.mostrarNotificacao('Cotação enviada e confirmada com sucesso!', 'success');
          },
          error: (error: unknown) => {
            console.error('Erro ao confirmar envio:', error);
            this.error = 'Erro ao confirmar envio';
            this.mostrarNotificacao('Erro ao confirmar envio. Tente novamente.', 'error');
          }
        });
      },
      error: (error: unknown) => {
        console.error('Erro ao obter cotação:', error);
        this.error = 'Erro ao obter cotação';
        this.mostrarNotificacao('Erro ao obter cotação. Tente novamente.', 'error');
      }
    });
  }

  cancelarCotacao(c: CotacaoEnviadaDisplay): void {
    const confirmar = confirm(`Cancelar cotação ${c.ref}? Esta cotação ficará inválida.`);
    if (!confirmar) return;

    this.cotacaoService.obterCotacao(c.id).subscribe({
      next: (cotacao: CotacaoResponse) => {
        if (!cotacao.cliente?.id) {
          this.error = 'Cliente inválido na cotação';
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
            this.carregarCotacoes();
            this.mostrarNotificacao('Cotação cancelada com sucesso!', 'success');
          },
          error: (error: unknown) => {
            console.error('Erro ao cancelar cotação:', error);
            this.error = 'Erro ao cancelar cotação';
            this.mostrarNotificacao('Erro ao cancelar cotação. Tente novamente.', 'error');
          }
        });
      },
      error: (error: unknown) => {
        console.error('Erro ao obter cotação:', error);
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
