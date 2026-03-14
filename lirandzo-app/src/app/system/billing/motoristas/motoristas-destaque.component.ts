import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';

interface MotoristaStoreMock {
  id: string;
  nome: string;
  desempenhoScore: number;      // 0-100
  totalViagens: number;
  totalKmPercorridos: number;
}

const MOTORISTAS_STORE_MOCK: MotoristaStoreMock[] = [
  { id: 'MOT-001', nome: 'Manuel Sitoe',    desempenhoScore: 92, totalViagens: 23, totalKmPercorridos: 18450 },
  { id: 'MOT-002', nome: 'Pedro Nhantumbo', desempenhoScore: 85, totalViagens: 18, totalKmPercorridos: 15200 },
  { id: 'MOT-003', nome: 'António Bila',    desempenhoScore: 78, totalViagens: 31, totalKmPercorridos: 26500 },
  { id: 'MOT-004', nome: 'Domingos Cuamba', desempenhoScore: 95, totalViagens: 12, totalKmPercorridos: 9100 },
  { id: 'MOT-005', nome: 'Rosa Mahumane',   desempenhoScore: 88, totalViagens: 8,  totalKmPercorridos: 6800 },
];

@Component({
  selector: 'app-motoristas-destaque',
  standalone: true,
  imports: [CommonModule, BillingSectionHeaderComponent],
  templateUrl: './motoristas-destaque.component.html',
  styleUrls: ['../shared/billing-page.css', './motoristas-destaque.component.css']
})
export class MotoristasDestaqueComponent {
  private get motoristasOrdenados(): MotoristaStoreMock[] {
    return [...MOTORISTAS_STORE_MOCK].sort((a, b) => b.desempenhoScore - a.desempenhoScore);
  }

  get motoristasDesempenho() {
    return this.motoristasOrdenados;
  }

  get top3() {
    return this.motoristasOrdenados.slice(0, 3);
  }

  getIniciais(nome: string): string {
    return nome
      .split(' ')
      .filter(p => !!p)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  }

  getScoreClass(score: number): string {
    if (score > 85) return 'driver-score-high';
    if (score >= 70) return 'driver-score-medium';
    return 'driver-score-low';
  }
}

