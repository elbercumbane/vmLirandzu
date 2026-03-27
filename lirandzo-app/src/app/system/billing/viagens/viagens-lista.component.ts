import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ViagemService, ViagemResponse } from '../../../services/viagem.service';

interface ViagemDisplay {
  id: number;
  codigo: string;
  motorista: string;
  viatura: string;
  origem: string;
  destino: string;
  kmPercorridos: number;
  combustivelGasto: number;
  custoTotal: number;
  encomendas: number;
  dataSaida: string;
  dataChegada: string;
  status: string;
}

@Component({
  selector: 'app-viagens-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './viagens-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './viagens-lista.component.css']
})
export class ViagensListaComponent implements OnInit {
  searchTerm = '';
  activeFilter = 'TODOS';
  viagens: ViagemDisplay[] = [];
  loading = true;
  error: string | null = null;

  constructor(private viagemService: ViagemService) {}

  ngOnInit() {
    this.carregarViagens();
  }

  carregarViagens() {
    this.loading = true;
    this.error = null;
    
    this.viagemService.listarViagens().subscribe({
      next: (viagensApi: ViagemResponse[]) => {
        this.viagens = viagensApi.map(v => this.mapearViagem(v));
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar viagens:', error);
        this.error = 'Erro ao carregar viagens da base de dados';
        this.loading = false;
        this.viagens = [];
      }
    });
  }

  private mapearViagem(viagem: ViagemResponse): ViagemDisplay {
    const statusMap: { [key: string]: string } = {
      'PLANEADA': 'AGENDADA',
      'EM_CURSO': 'EM CURSO',
      'CONCLUIDA': 'CONCLUÍDA',
      'CANCELADA': 'CANCELADA'
    };

    const statusDisplay = statusMap[viagem.status?.toUpperCase() || ''] || viagem.status || 'AGENDADA';
    
    const codigo = `VGM-${new Date().getFullYear()}-${String(viagem.id).padStart(3, '0')}`;
    
    const formatarData = (data?: string) => {
      if (!data) return '';
      return new Date(data).toLocaleDateString('pt-MZ', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };

    return {
      id: viagem.id,
      codigo,
      motorista: viagem.motorista?.nome || 'Não atribuído',
      viatura: viagem.viatura ? `${viagem.viatura.matricula} (${viagem.viatura.marca} ${viagem.viatura.modelo})` : 'Não atribuída',
      origem: viagem.origem || '',
      destino: viagem.destino || '',
      kmPercorridos: 0, // Calcular se necessário
      combustivelGasto: viagem.combustivelConsumido || 0,
      custoTotal: viagem.custoCombustivel || 0,
      encomendas: 0, // Contar se necessário
      dataSaida: formatarData(viagem.dataPartida),
      dataChegada: formatarData(viagem.dataChegadaReal),
      status: statusDisplay
    };
  }

  get filteredViagens() {
    let list = this.viagens;
    if (this.activeFilter !== 'TODOS') {
      list = list.filter(v => v.status === this.activeFilter);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(v => 
        v.codigo.toLowerCase().includes(term) || 
        v.motorista.toLowerCase().includes(term)
      );
    }
    return list;
  }

  get totalKm() { return this.viagens.reduce((s, v) => s + v.kmPercorridos, 0); }
  get totalCombustivel() { return this.viagens.reduce((s, v) => s + v.combustivelGasto, 0); }
  get totalCusto() { return this.viagens.reduce((s, v) => s + v.custoTotal, 0); }

  setFilter(f: string) { this.activeFilter = f; }
}
