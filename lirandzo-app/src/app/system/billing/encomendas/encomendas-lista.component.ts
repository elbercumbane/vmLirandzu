import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { EncomendaService, EncomendaResponse } from '../../../services/encomenda.service';

interface EncomendaDisplay {
  id: number;
  numero: string;
  factura: string;
  cliente: string;
  telefone: string;
  produto: string;
  origem: string;
  destino: string;
  total: number;
  pago: number;
  divida: number;
  status: string;
  data: string;
}

@Component({
  selector: 'app-encomendas-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './encomendas-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './encomendas-lista.component.css']
})
export class EncomendasListaComponent implements OnInit {
  searchTerm = '';
  activeFilter = 'TODOS';
  encomendas: EncomendaDisplay[] = [];
  loading = true;
  error: string | null = null;

  pageTitle = 'Recibo e lista de facturas';
  pageSubtitle = 'Gestão de pagamentos, saldo em falta e todas as facturas (pagar / ver)';
  helpTitle = 'Como usar esta lista';
  helpItems: string[] = [
    'Use os filtros e a pesquisa para encontrar encomendas por nº, factura, cliente ou produto.',
    'O estado reflecte o total pago face ao total da factura: pago integral, parcial ou em falta.',
    'Para emitir a partir de uma cotação aceite, use «Cotações para facturar» no menu.',
    'Para registar pagamentos e conciliar com o banco, use «Baixas & tesouraria».'
  ];

  constructor(
    private encomendaService: EncomendaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const pagas = this.route.snapshot.url.some((s) => s.path === 'pagas');
    if (pagas) {
      this.activeFilter = 'PAGO';
      this.pageTitle = 'Facturas pagas';
      this.pageSubtitle = 'Apenas encomendas com pagamento integral confirmado';
      this.helpTitle = 'Lista só de facturas liquidadas';
      this.helpItems = [
        'Esta vista mostra só documentos com saldo zero (total = pago).',
        'Para pagamentos parciais ou em dívida, volte à «Lista de facturas» e filtre por Parcial ou Não pago.',
        'O histórico de recebimentos por linha está na página da encomenda e na tesouraria.'
      ];
    }
    this.carregarEncomendas();
  }

  carregarEncomendas() {
    this.loading = true;
    this.error = null;
    
    this.encomendaService.listarEncomendas().subscribe({
      next: (encomendasApi: EncomendaResponse[]) => {
        this.encomendas = encomendasApi.map(e => this.mapearEncomenda(e));
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar encomendas:', error);
        this.error = 'Erro ao carregar encomendas da base de dados';
        this.loading = false;
        // Manter array vazio em caso de erro
        this.encomendas = [];
      }
    });
  }

  private mapearEncomenda(encomenda: EncomendaResponse): EncomendaDisplay {
    // Mapear status da API para formato de exibição
    let statusDisplay = 'NÃO PAGO';
    const statusUpper = (encomenda.status || '').toUpperCase();
    if (statusUpper === 'PAID' || statusUpper === 'PAGO') {
      statusDisplay = 'PAGO';
    } else if (statusUpper === 'PARTIAL' || statusUpper === 'PARCIAL') {
      statusDisplay = 'PARCIAL';
    } else if (statusUpper === 'UNPAID' || statusUpper === 'NAO_PAGO' || statusUpper === 'NÃO_PAGO') {
      statusDisplay = 'NÃO PAGO';
    }

    // Formatar data
    const dataFormatada = encomenda.dataEncomenda 
      ? new Date(encomenda.dataEncomenda).toLocaleDateString('pt-MZ', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })
      : '';

    // Formatar número de encomenda (com padding de zeros)
    const numeroFormatado = `VML-${String(encomenda.numeroEncomenda).padStart(4, '0')}`;
    const factura = encomenda.invoiceNumber?.trim() || '—';

    return {
      id: encomenda.numeroEncomenda,
      numero: numeroFormatado,
      factura,
      cliente: encomenda.cliente?.nome || 'Cliente não especificado',
      telefone: encomenda.cliente?.telefone || '',
      produto: encomenda.produto || '',
      origem: encomenda.origem || '',
      destino: encomenda.destino || '',
      total: encomenda.valorTotal || 0,
      pago: encomenda.valorPago || 0,
      divida: encomenda.valorDivida || 0,
      status: statusDisplay,
      data: dataFormatada
    };
  }

  get filteredEncomendas() {
    let list = this.encomendas;
    if (this.activeFilter !== 'TODOS') {
      list = list.filter(e => e.status === this.activeFilter);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(e =>
        e.numero.toLowerCase().includes(term) ||
        e.factura.toLowerCase().includes(term) ||
        e.cliente.toLowerCase().includes(term) ||
        e.produto.toLowerCase().includes(term) ||
        e.origem.toLowerCase().includes(term) ||
        e.destino.toLowerCase().includes(term)
      );
    }
    return list;
  }

  get totalValor() { return this.encomendas.reduce((s, e) => s + e.total, 0); }
  get totalDivida() { return this.encomendas.reduce((s, e) => s + e.divida, 0); }
  get pagoPercent() {
    const total = this.encomendas.length;
    if (total === 0) return 0;
    const pagas = this.encomendas.filter(e => e.status === 'PAGO').length;
    return Math.round((pagas / total) * 100);
  }

  get clientesEmDivida() {
    return this.encomendas.filter(e => e.divida > 0).length;
  }

  get encomendasPagas() {
    return this.encomendas.filter(e => e.status === 'PAGO').length;
  }

  setFilter(f: string) { this.activeFilter = f; }
}
