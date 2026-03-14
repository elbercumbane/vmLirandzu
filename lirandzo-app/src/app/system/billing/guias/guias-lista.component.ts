import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { GuiaRemessaService, GuiaRemessaResponse } from '../../../services/guia-remessa.service';

interface GuiaDisplay {
  id: number;
  ref: string;
  data: string;
  motorista: string;
  viatura: string;
  origem: string;
  destino: string;
  totalCargas: number;
  totalClientes: number;
  estado: string;
  valorTotal: number;
}

@Component({
  selector: 'app-guias-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './guias-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './guias-lista.component.css']
})
export class GuiasListaComponent implements OnInit {
  filtro = '';
  filtroEstado = 'TODOS';
  guias: GuiaDisplay[] = [];
  loading = true;
  error: string | null = null;

  constructor(private guiaRemessaService: GuiaRemessaService) {}

  ngOnInit() {
    this.carregarGuias();
  }

  carregarGuias() {
    this.loading = true;
    this.error = null;

    this.guiaRemessaService.listarGuiasRemessa().subscribe({
      next: (guiasApi: GuiaRemessaResponse[]) => {
        this.guias = guiasApi.map(g => this.mapearGuia(g));
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar guias:', error);
        this.error = 'Erro ao carregar guias da base de dados';
        this.loading = false;
        this.guias = [];
      }
    });
  }

  private mapearGuia(guia: GuiaRemessaResponse): GuiaDisplay {
    const statusMap: { [key: string]: string } = {
      'EM_TRANSITO': 'EM TRÂNSITO',
      'ENTREGUE': 'ENTREGUE',
      'CANCELADA': 'CANCELADA'
    };

    const estado = statusMap[guia.status?.toUpperCase() || ''] || 'EM TRÂNSITO';
    
    const formatarData = (data?: string) => {
      if (!data) return '';
      return new Date(data).toLocaleDateString('pt-MZ', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };

    // Contar clientes únicos
    const clientesUnicos = new Set();
    if (guia.itens) {
      guia.itens.forEach(item => {
        if (item.cliente?.id) {
          clientesUnicos.add(item.cliente.id);
        }
      });
    }

    return {
      id: guia.id,
      ref: guia.referencia || `GR-${new Date().getFullYear()}-${String(guia.id).padStart(3, '0')}`,
      data: formatarData(guia.dataGuia),
      motorista: guia.motorista?.nome || 'Não atribuído',
      viatura: guia.viatura ? `${guia.viatura.matricula} (${guia.viatura.marca} ${guia.viatura.modelo})` : 'Não atribuída',
      origem: guia.origem || '',
      destino: guia.destino || '',
      totalCargas: guia.itens?.length || 0,
      totalClientes: clientesUnicos.size,
      estado,
      valorTotal: guia.valorTotal || 0
    };
  }

  get guiasFiltradas() {
    let lista = this.guias;
    if (this.filtroEstado !== 'TODOS') {
      lista = lista.filter(g => g.estado === this.filtroEstado);
    }
    if (this.filtro.trim()) {
      const f = this.filtro.toLowerCase();
      lista = lista.filter(g => 
        g.ref.toLowerCase().includes(f) || 
        g.motorista.toLowerCase().includes(f) || 
        g.destino.toLowerCase().includes(f)
      );
    }
    return lista;
  }

  get totalGuias() { return this.guias.length; }
  get guiasEntregues() { return this.guias.filter(g => g.estado === 'ENTREGUE').length; }
  get guiasEmTransito() { return this.guias.filter(g => g.estado === 'EM TRÂNSITO').length; }
  get guiasPendentes() { return this.guias.filter(g => g.estado === 'PENDENTE').length; }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'ENTREGUE': return 'badge badge-success';
      case 'EM TRÂNSITO': return 'badge badge-warning';
      case 'PENDENTE': return 'badge badge-info';
      default: return 'badge';
    }
  }
}
