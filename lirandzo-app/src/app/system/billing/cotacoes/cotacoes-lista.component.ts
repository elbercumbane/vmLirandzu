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
        this.pedidos = cotacoes.map(c => this.mapearCotacao(c));
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

    let tempoResposta = '';
    if (c.dataCotacao && c.dataResposta) {
      const inicio = new Date(c.dataCotacao);
      const fim = new Date(c.dataResposta);
      const diffMs = fim.getTime() - inicio.getTime();
      if (diffMs > 0) {
        const diffMin = Math.round(diffMs / 60000);
        const horas = Math.floor(diffMin / 60);
        const minutos = diffMin % 60;
        tempoResposta = horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`;
      }
    }

    const statusMap: { [key: string]: string } = {
      'PENDENTE': 'PENDENTE',
      'RESPONDIDO': 'RESPONDIDO',
      'COTACAO_GERADA': 'COTAÇÃO GERADA',
      'EXPIRADA': 'EXPIRADA',
      'CANCELADA': 'CANCELADA'
    };
    const estado = statusMap[c.status?.toUpperCase() || ''] || 'PENDENTE';

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

  get pedidosFiltrados() {
    let lista = this.pedidos;
    if (this.filtroEstado !== 'TODOS') {
      lista = lista.filter(p => p.estado === this.filtroEstado);
    }
    if (this.filtro.trim()) {
      const f = this.filtro.toLowerCase();
      lista = lista.filter(p =>
        p.cliente.toLowerCase().includes(f) ||
        p.ref.toLowerCase().includes(f) ||
        p.destino.toLowerCase().includes(f) ||
        p.descricaoCarga.toLowerCase().includes(f)
      );
    }
    return lista;
  }

  get totalPendentes() { return this.pedidos.filter(p => p.estado === 'PENDENTE').length; }
  get totalRespondidos() { return this.pedidos.filter(p => p.estado === 'RESPONDIDO').length; }
  get totalGerados() { return this.pedidos.filter(p => p.estado === 'COTAÇÃO GERADA').length; }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDENTE': return 'badge badge-warning';
      case 'RESPONDIDO': return 'badge badge-info';
      case 'COTAÇÃO GERADA': return 'badge badge-success';
      default: return 'badge';
    }
  }
}
