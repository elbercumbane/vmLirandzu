import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { CotacaoService, CotacaoResponse } from '../../../services/cotacao.service';

interface PedidoCotacaoDisplay {
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
}

@Component({
  selector: 'app-cotacoes-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './cotacoes-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './cotacoes-lista.component.css']
})
export class CotacoesListaComponent implements OnInit {
  filtro = '';
  filtroEstado = 'TODOS';
  pedidos: PedidoCotacaoDisplay[] = [];
  loading = true;
  error: string | null = null;

  constructor(private cotacaoService: CotacaoService) {}

  ngOnInit() {
    this.carregarCotacoes();
  }

  carregarCotacoes() {
    this.loading = true;
    this.error = null;

    this.cotacaoService.listarCotacoes().subscribe({
      next: (cotacoes: CotacaoResponse[]) => {
        // Mostrar mais recentes primeiro (pedidos antigos ficam por último).
        const sorted = [...cotacoes].sort((a, b) => {
          const ta = a.dataCriacao ? new Date(a.dataCriacao).getTime() : (a.dataCotacao ? new Date(a.dataCotacao).getTime() : 0);
          const tb = b.dataCriacao ? new Date(b.dataCriacao).getTime() : (b.dataCotacao ? new Date(b.dataCotacao).getTime() : 0);
          return tb - ta;
        });
        this.pedidos = sorted.map(c => this.mapearCotacao(c));
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar cotações:', error);
        this.error = 'Erro ao carregar cotações da base de dados';
        this.loading = false;
        this.pedidos = [];
      }
    });
  }

  private mapearCotacao(c: CotacaoResponse): PedidoCotacaoDisplay {
    const clienteNome = c.cliente?.nome || 'Cliente não especificado';
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

    let tempoResposta = '—';
    const statusUpperTempo = c.status?.toUpperCase() || '';
    const isRespondido = statusUpperTempo === 'RESPONDIDO' || statusUpperTempo === 'RESPONDED';
    if (c.dataCriacao && c.dataResposta && isRespondido) {
      const inicioMs = new Date(c.dataCriacao).getTime();
      const fimMs = new Date(c.dataResposta).getTime();
      const diffMs = fimMs - inicioMs;
      tempoResposta = diffMs >= 0 ? this.formatarDuracao(diffMs) : '—';
    }

    // Mapeamento do status vindo do backend (enum em inglês) para UI em PT.
    const statusUpper = c.status?.toUpperCase() || '';
    let estado = 'PENDENTE';
    switch (statusUpper) {
      case 'PENDING':
      case 'PENDENTE':
        estado = 'PENDENTE';
        break;
      case 'RESPONDED':
      case 'RESPONDIDO':
        estado = 'RESPONDIDO';
        break;
      case 'QUOTATION_GENERATED':
      case 'COTACAO_GERADA':
      case 'COTACAO GERADA':
      case 'COTAÇÃO GERADA':
        estado = 'COTAÇÃO GERADA';
        break;
      case 'EXPIRED':
      case 'EXPIRADA':
        estado = 'EXPIRADA';
        break;
      case 'CANCELLED':
      case 'CANCELADA':
        estado = 'CANCELADA';
        break;
      default:
        estado = 'PENDENTE';
    }

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
      tempoResposta: tempoResposta || '—'
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

  get pedidosFiltrados() {
    // Esta página mostra apenas pedidos NÃO respondidos.
    return this.pedidos.filter(p => p.estado !== 'RESPONDIDO');
  }

  get totalPendentes() { return this.pedidosFiltrados.filter(p => p.estado === 'PENDENTE').length; }
  get totalRespondidos() { return 0; }
  get totalGerados() { return this.pedidosFiltrados.filter(p => p.estado === 'COTAÇÃO GERADA').length; }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDENTE': return 'badge badge-warning';
      case 'RESPONDIDO': return 'badge badge-info';
      case 'COTAÇÃO GERADA': return 'badge badge-success';
      case 'CANCELADA': return 'badge badge-danger';
      default: return 'badge';
    }
  }
}
