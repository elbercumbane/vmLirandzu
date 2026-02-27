import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-viagens-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './viagens-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './viagens-lista.component.css']
})
export class ViagensListaComponent {
  searchTerm = '';
  activeFilter = 'TODOS';

  viagens = [
    { id: 1, codigo: 'VGM-2025-001', motorista: 'João Macuácua', viatura: 'MDD-45-78', origem: 'Maputo', destino: 'Beira', kmPercorridos: 1200, combustivelGasto: 420, custoTotal: 18500, encomendas: 3, dataSaida: '10/01/2025', dataChegada: '11/01/2025', status: 'CONCLUÍDA' },
    { id: 2, codigo: 'VGM-2025-002', motorista: 'Alberto Chissano', viatura: 'MPT-12-34', origem: 'Maputo', destino: 'Nampula', kmPercorridos: 2400, combustivelGasto: 840, custoTotal: 35200, encomendas: 5, dataSaida: '15/01/2025', dataChegada: '17/01/2025', status: 'CONCLUÍDA' },
    { id: 3, codigo: 'VGM-2025-003', motorista: 'Mário Tembe', viatura: 'MNP-56-90', origem: 'Maputo', destino: 'Tete', kmPercorridos: 1800, combustivelGasto: 0, custoTotal: 0, encomendas: 4, dataSaida: '20/01/2025', dataChegada: '', status: 'EM CURSO' },
    { id: 4, codigo: 'VGM-2025-004', motorista: 'Samuel Dinis', viatura: 'MTT-67-89', origem: 'Maputo', destino: 'Inhambane', kmPercorridos: 470, combustivelGasto: 85, custoTotal: 8200, encomendas: 2, dataSaida: '22/01/2025', dataChegada: '22/01/2025', status: 'CONCLUÍDA' },
    { id: 5, codigo: 'VGM-2025-005', motorista: 'João Macuácua', viatura: 'MDD-45-78', origem: 'Beira', destino: 'Maputo', kmPercorridos: 0, combustivelGasto: 0, custoTotal: 0, encomendas: 2, dataSaida: '25/01/2025', dataChegada: '', status: 'AGENDADA' }
  ];

  get filteredViagens() {
    let list = this.viagens;
    if (this.activeFilter !== 'TODOS') list = list.filter(v => v.status === this.activeFilter);
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(v => v.codigo.toLowerCase().includes(term) || v.motorista.toLowerCase().includes(term));
    }
    return list;
  }

  get totalKm() { return this.viagens.reduce((s, v) => s + v.kmPercorridos, 0); }
  get totalCombustivel() { return this.viagens.reduce((s, v) => s + v.combustivelGasto, 0); }
  get totalCusto() { return this.viagens.reduce((s, v) => s + v.custoTotal, 0); }

  setFilter(f: string) { this.activeFilter = f; }
}
