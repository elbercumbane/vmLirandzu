import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { MotoristaService, Motorista } from '../../../services/motorista.service';

interface MotoristaDisplay {
  id: number;
  nome: string;
  telefone: string;
  carta: string;
  avaliacao: number;
  status: string;
}

@Component({
  selector: 'app-motoristas-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './motoristas-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './motoristas-lista.component.css']
})
export class MotoristasListaComponent implements OnInit {
  searchTerm = '';
  activeFilter = 'TODOS';
  motoristas: MotoristaDisplay[] = [];
  loading = true;
  error: string | null = null;

  constructor(private motoristaService: MotoristaService) {}

  ngOnInit() {
    this.carregarMotoristas();
  }

  carregarMotoristas() {
    this.loading = true;
    this.error = null;

    this.motoristaService.listarMotoristas().subscribe({
      next: (motoristasApi: Motorista[]) => {
        this.motoristas = motoristasApi.map(m => this.mapearMotorista(m));
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar motoristas:', error);
        this.error = 'Erro ao carregar motoristas da base de dados';
        this.loading = false;
        this.motoristas = [];
      }
    });
  }

  private mapearMotorista(motorista: Motorista): MotoristaDisplay {
    const statusMap: { [key: string]: string } = {
      'ATIVO': 'DISPONÍVEL',
      'INATIVO': 'INACTIVO'
    };

    const statusDisplay = statusMap[motorista.status?.toUpperCase() || ''] || motorista.status || 'DISPONÍVEL';

    return {
      id: motorista.id || 0,
      nome: motorista.nome || '',
      telefone: motorista.telefone || 'N/A',
      carta: motorista.numeroCarta || 'N/A',
      avaliacao: motorista.avaliacaoMedia || 0,
      status: statusDisplay
    };
  }

  get filteredMotoristas() {
    let list = this.motoristas;
    if (this.activeFilter !== 'TODOS') {
      list = list.filter(m => m.status === this.activeFilter);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(m => 
        m.nome.toLowerCase().includes(term) || 
        m.telefone.toLowerCase().includes(term)
      );
    }
    return list;
  }

  get totalMotoristas() { return this.motoristas.length; }
  get disponiveis() { return this.motoristas.filter(m => m.status === 'DISPONÍVEL').length; }
  get emViagem() { return this.motoristas.filter(m => m.status === 'EM VIAGEM').length; }
  get avaliacaoMedia() {
    if (this.motoristas.length === 0) return '0.0';
    const sum = this.motoristas.reduce((a, m) => a + m.avaliacao, 0);
    return (sum / this.motoristas.length).toFixed(1);
  }

  setFilter(f: string) { this.activeFilter = f; }
}
