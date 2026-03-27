import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ManutencaoService, Manutencao } from '../../../services/manutencao.service';

@Component({
  selector: 'app-manutencao-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './manutencao-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './manutencao-lista.component.css']
})
export class ManutencaoListaComponent implements OnInit {
  manutencoes: Manutencao[] = [];
  searchTerm = '';
  loading = true;
  error: string | null = null;

  constructor(private manutencaoService: ManutencaoService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading = true;
    this.error = null;
    this.manutencaoService.listar().subscribe({
      next: (lista) => {
        this.manutencoes = lista || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar manutenções.';
        this.loading = false;
        this.manutencoes = [];
      }
    });
  }

  get filtered(): Manutencao[] {
    if (!this.searchTerm?.trim()) return this.manutencoes;
    const t = this.searchTerm.toLowerCase();
    return this.manutencoes.filter(m =>
      (m.vehiclePlate || '').toLowerCase().includes(t) ||
      (m.vehicleName || '').toLowerCase().includes(t) ||
      (m.type || '').toLowerCase().includes(t) ||
      (m.description || '').toLowerCase().includes(t) ||
      (m.workshop || '').toLowerCase().includes(t)
    );
  }

  get totalCusto(): number {
    return this.manutencoes.reduce((s, m) => s + (m.cost || 0), 0);
  }

  formatarData(d?: string): string {
    return d ? new Date(d).toLocaleDateString('pt-MZ') : '—';
  }

  formatarTipo(t?: string): string {
    const map: Record<string, string> = { PREVENTIVA: 'Preventiva', CORRETIVA: 'Correctiva', INSPECAO: 'Inspecção', REVISAO: 'Revisão' };
    return map[t || ''] || t || '—';
  }
}
