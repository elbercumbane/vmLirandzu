import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';

interface ClienteResumo {
  id: number;
  nome: string;
  provincia: string;
  contacto: string;
  telefone: string;
}

interface EncomendaResumo {
  numero: string;
  data: string;
  produto: string;
  origem: string;
  destino: string;
  total: number;
  pago: number;
  divida: number;
  status: string;
  cliente: string;
}

interface CotacaoResumo {
  ref: string;
  dataEntrada: string;
  estado: string;
  origem: string;
  destino: string;
  descricaoCarga: string;
  cliente: string;
}

interface LinhaHistorico {
  tipo: 'Encomenda' | 'Cotação' | 'Recebimento' | 'Dívida';
  ref: string;
  data: string;
  descricao: string;
  rota: string;
  valor: number;
  status: string;
}

@Component({
  selector: 'app-cliente-historico',
  standalone: true,
  imports: [CommonModule, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './cliente-historico.component.html',
  styleUrls: ['../shared/billing-page.css', './cliente-historico.component.css']
})
export class ClienteHistoricoComponent {
  // Mock simples reutilizando os mesmos nomes usados nas listas de Clientes, Encomendas e Cotações
  clientes: ClienteResumo[] = [
    { id: 1, nome: 'SLR Mining, Lda', provincia: 'Cabo Delgado', contacto: 'Sr. Euclides', telefone: '847983277' },
    { id: 2, nome: 'Cervejas de Moçambique', provincia: 'Maputo Cidade', contacto: 'Sr. António', telefone: '841234567' },
    { id: 3, nome: 'TotalEnergies Moçambique', provincia: 'Sofala', contacto: 'Sra. Maria', telefone: '842345678' },
    { id: 4, nome: 'Shoprite Moçambique', provincia: 'Nampula', contacto: 'Sr. Pedro', telefone: '844567890' },
    { id: 5, nome: 'Kenmare Resources', provincia: 'Nampula', contacto: 'Sr. James', telefone: '846789012' }
  ];

  encomendas: EncomendaResumo[] = [
    { numero: 'VML-2025-0001', data: '02/01/2025', produto: 'iPhone 15 Pro 256GB', origem: 'Maputo', destino: 'Beira', total: 45200, pago: 45200, divida: 0, status: 'PAGO', cliente: 'SLR Mining, Lda' },
    { numero: 'VML-2025-0002', data: '05/01/2025', produto: 'Samsung TV 55\" 4K', origem: 'Johannesburg', destino: 'Maputo', total: 38500, pago: 20000, divida: 18500, status: 'PARCIAL', cliente: 'Cervejas de Moçambique' },
    { numero: 'VML-2025-0003', data: '07/01/2025', produto: 'Nike Air Max + Adidas', origem: 'Durban', destino: 'Maputo', total: 12800, pago: 0, divida: 12800, status: 'NÃO PAGO', cliente: 'Shoprite Moçambique' },
    { numero: 'VML-2025-0004', data: '09/01/2025', produto: 'Laptop Lenovo IdeaPad', origem: 'Maputo', destino: 'Nampula', total: 52000, pago: 52000, divida: 0, status: 'PAGO', cliente: 'TotalEnergies Moçambique' }
  ];

  cotacoes: CotacaoResumo[] = [
    { ref: 'COT-2025-001', dataEntrada: '20/01/2025', estado: 'PENDENTE', origem: 'Maputo', destino: 'Cabo Delgado', descricaoCarga: 'Material de construção — 20 toneladas', cliente: 'SLR Mining, Lda' },
    { ref: 'COT-2025-002', dataEntrada: '18/01/2025', estado: 'RESPONDIDO', origem: 'Maputo', destino: 'Beira', descricaoCarga: 'Bebidas — carga completa', cliente: 'Cervejas de Moçambique' },
    { ref: 'COT-2025-003', dataEntrada: '15/01/2025', estado: 'COTAÇÃO GERADA', origem: 'Beira', destino: 'Tete', descricaoCarga: 'Equipamento industrial — 15 toneladas', cliente: 'TotalEnergies Moçambique' },
    { ref: 'COT-2025-004', dataEntrada: '22/01/2025', estado: 'PENDENTE', origem: 'Maputo', destino: 'Nampula', descricaoCarga: 'Produtos alimentares — 3 paletes', cliente: 'Shoprite Moçambique' }
  ];

  filtro = '';
  selectedClienteNome: string = this.clientes[0]?.nome ?? '';

  get clientesFiltrados(): ClienteResumo[] {
    if (!this.filtro.trim()) return this.clientes;
    const f = this.filtro.toLowerCase();
    return this.clientes.filter(c =>
      c.nome.toLowerCase().includes(f) ||
      c.provincia.toLowerCase().includes(f) ||
      c.contacto.toLowerCase().includes(f)
    );
  }

  onFiltroChange(): void {
    const lista = this.clientesFiltrados;
    this.selectedClienteNome = lista[0]?.nome ?? '';
  }

  get clienteSelecionado(): ClienteResumo | undefined {
    return this.clientes.find(c => c.nome === this.selectedClienteNome);
  }

  get encomendasDoCliente(): EncomendaResumo[] {
    return this.encomendas.filter(e => e.cliente === this.selectedClienteNome);
  }

  get cotacoesDoCliente(): CotacaoResumo[] {
    return this.cotacoes.filter(c => c.cliente === this.selectedClienteNome);
  }

  get totalEncomendas(): number {
    return this.encomendasDoCliente.length;
  }

  get totalFaturado(): number {
    return this.encomendasDoCliente.reduce((s, e) => s + e.total, 0);
  }

  get totalDivida(): number {
    return this.encomendasDoCliente.reduce((s, e) => s + e.divida, 0);
  }

  get totalCotacoes(): number {
    return this.cotacoesDoCliente.length;
  }

  get historicoDoCliente(): LinhaHistorico[] {
    const linhas: LinhaHistorico[] = [];

    for (const e of this.encomendasDoCliente) {
      // Encomenda em si
      linhas.push({
        tipo: 'Encomenda',
        ref: e.numero,
        data: e.data,
        descricao: e.produto,
        rota: `${e.origem} → ${e.destino}`,
        valor: e.total,
        status: e.status
      });

      // Pagamento (se existir)
      if (e.pago > 0) {
        linhas.push({
          tipo: 'Recebimento',
          ref: e.numero,
          data: e.data,
          descricao: `Pagamento da encomenda ${e.numero}`,
          rota: `${e.origem} → ${e.destino}`,
          valor: e.pago,
          status: 'Pago'
        });
      }

      // Dívida (se existir)
      if (e.divida > 0) {
        linhas.push({
          tipo: 'Dívida',
          ref: e.numero,
          data: e.data,
          descricao: `Dívida da encomenda ${e.numero}`,
          rota: `${e.origem} → ${e.destino}`,
          valor: e.divida,
          status: 'Em aberto'
        });
      }
    }

    for (const c of this.cotacoesDoCliente) {
      linhas.push({
        tipo: 'Cotação',
        ref: c.ref,
        data: c.dataEntrada,
        descricao: c.descricaoCarga,
        rota: `${c.origem} → ${c.destino}`,
        valor: 0,
        status: c.estado
      });
    }

    return linhas;
  }
}

