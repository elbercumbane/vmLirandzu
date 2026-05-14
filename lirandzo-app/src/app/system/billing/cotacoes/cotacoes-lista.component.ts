import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
}

@Component({
  selector: 'app-cotacoes-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, BillingSectionHeaderComponent],
  templateUrl: './cotacoes-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './cotacoes-lista.component.css']
})
export class CotacoesListaComponent implements OnInit {
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
      operador: c.operador || ''
    };
  }

  get pedidosFiltrados() {
    // Esta página mostra apenas pedidos NÃO respondidos (aceites saem da fila desta vista).
    return this.pedidos.filter(p => p.estado !== 'RESPONDIDO');
  }

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
