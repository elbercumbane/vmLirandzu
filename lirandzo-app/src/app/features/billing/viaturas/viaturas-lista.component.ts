import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ViaturaService, Viatura } from '../../../services/viatura.service';

interface ViaturaDisplay {
  id: number;
  matricula: string;
  marca: string;
  modelo: string;
  tipo: string;
  capacidade: number;
  status: string;
}

@Component({
  selector: 'app-viaturas-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './viaturas-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './viaturas-lista.component.css']
})
export class ViaturasListaComponent implements OnInit {
  searchTerm = '';
  activeFilter = 'TODOS';
  viaturas: ViaturaDisplay[] = [];
  loading = true;
  error: string | null = null;

  constructor(private viaturaService: ViaturaService) {}

  ngOnInit() {
    this.carregarViaturas();
  }

  carregarViaturas() {
    this.loading = true;
    this.error = null;

    this.viaturaService.listarViaturas().subscribe({
      next: (viaturasApi: Viatura[]) => {
        this.viaturas = viaturasApi.map(v => this.mapearViatura(v));
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar viaturas:', error);
        this.error = 'Erro ao carregar viaturas da base de dados';
        this.loading = false;
        this.viaturas = [];
      }
    });
  }

  private mapearViatura(viatura: Viatura): ViaturaDisplay {
    const statusMap: { [key: string]: string } = {
      'ATIVA': 'OPERACIONAL',
      'EM_MANUTENCAO': 'MANUTENÇÃO',
      'RESERVADA': 'RESERVADA',
      'INATIVA': 'PARADO'
    };

    const statusDisplay = statusMap[viatura.status?.toUpperCase() || ''] || viatura.status || 'OPERACIONAL';

    return {
      id: viatura.id || 0,
      matricula: viatura.matricula || '',
      marca: viatura.marca || '',
      modelo: viatura.modelo || '',
      tipo: viatura.tipo || 'N/A',
      capacidade: viatura.capacidade || 0,
      status: statusDisplay
    };
  }

  get filteredViaturas() {
    let list = this.viaturas;
    if (this.activeFilter !== 'TODOS') {
      list = list.filter(v => v.status === this.activeFilter);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(v => 
        v.matricula.toLowerCase().includes(term) || 
        v.marca.toLowerCase().includes(term) ||
        v.modelo.toLowerCase().includes(term)
      );
    }
    return list;
  }

  get totalViaturas() { return this.viaturas.length; }
  get operacionais() { return this.viaturas.filter(v => v.status === 'OPERACIONAL').length; }
  get emManutencao() { return this.viaturas.filter(v => v.status === 'MANUTENÇÃO').length; }
  get consumoMedioGeral() {
    // Nota: O consumo médio não está disponível na entidade Viatura do backend
    // Se necessário, pode ser adicionado no futuro
    return 'N/A';
  }

  setFilter(f: string) { this.activeFilter = f; }
}
