import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { MotoristaService, Motorista } from '../../../services/motorista.service';

interface MotoristaDesempenho {
  id: number;
  nome: string;
  avaliacaoMedia: number;
  desempenhoScore: number;  // 0-100, derivado de avaliacaoMedia
  numeroViagens: number;
}

@Component({
  selector: 'app-motoristas-destaque',
  standalone: true,
  imports: [CommonModule, BillingSectionHeaderComponent],
  templateUrl: './motoristas-destaque.component.html',
  styleUrls: ['../shared/billing-page.css', './motoristas-destaque.component.css']
})
export class MotoristasDestaqueComponent implements OnInit {
  motoristasDesempenho: MotoristaDesempenho[] = [];
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
      next: (lista: Motorista[]) => {
        this.motoristasDesempenho = lista.map(m => ({
          id: m.id || 0,
          nome: m.nome || '',
          avaliacaoMedia: m.avaliacaoMedia || 0,
          desempenhoScore: Math.round((m.avaliacaoMedia || 0) * 20),
          numeroViagens: m.numeroViagens || 0
        })).sort((a, b) => b.desempenhoScore - a.desempenhoScore);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar motoristas:', err);
        this.error = 'Erro ao carregar dados.';
        this.loading = false;
        this.motoristasDesempenho = [];
      }
    });
  }

  get avaliacaoMediaGeral(): string {
    if (this.motoristasDesempenho.length === 0) return '0.0';
    const sum = this.motoristasDesempenho.reduce((a, m) => a + m.avaliacaoMedia, 0);
    return (sum / this.motoristasDesempenho.length).toFixed(1);
  }

  get top3(): MotoristaDesempenho[] {
    return this.motoristasDesempenho.slice(0, 3);
  }

  getIniciais(nome: string): string {
    return nome
      .split(' ')
      .filter(p => !!p)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('') || '?';
  }

  getScoreClass(score: number): string {
    if (score > 85) return 'driver-score-high';
    if (score >= 70) return 'driver-score-medium';
    return 'driver-score-low';
  }
}
