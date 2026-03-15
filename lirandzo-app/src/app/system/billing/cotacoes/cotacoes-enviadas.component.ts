import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { CotacaoService, CotacaoResponse } from '../../../services/cotacao.service';

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
}

@Component({
  selector: 'app-cotacoes-enviadas',
  standalone: true,
  imports: [CommonModule, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './cotacoes-enviadas.component.html',
  styleUrls: ['../shared/billing-page.css', './cotacoes-enviadas.component.css']
})
export class CotacoesEnviadasComponent implements OnInit {
  filtro = '';
  filtroEstado = 'TODOS';
  cotacoes: CotacaoEnviadaDisplay[] = [];
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
        console.log('Todas as cotações recebidas:', cotacoes);
        // Filtrar apenas cotações geradas e enviadas (COTACAO_GERADA)
        // O backend retorna o status como string, pode vir com diferentes formatos
        const enviadas = cotacoes.filter(c => {
          const statusUpper = (c.status || '').toUpperCase();
          return statusUpper === 'COTACAO_GERADA' || statusUpper === 'COTACAO GERADA';
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

    const statusUpper = (c.status || '').toUpperCase();
    const statusMap: { [key: string]: string } = {
      'RESPONDIDO': 'RESPONDIDO',
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
      formaEnvio
    };
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
    return lista;
  }

  get totalGerados() { return this.cotacoes.filter(c => c.estado === 'COTAÇÃO GERADA').length; }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'COTAÇÃO GERADA': return 'badge badge-success';
      default: return 'badge badge-success';
    }
  }
}
