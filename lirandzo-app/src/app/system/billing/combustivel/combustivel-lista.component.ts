import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { AbastecimentoService, Abastecimento } from '../../../services/abastecimento.service';

@Component({
  selector: 'app-combustivel-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './combustivel-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './combustivel-lista.component.css']
})
export class CombustivelListaComponent implements OnInit {
  abastecimentos: Abastecimento[] = [];
  searchTerm = '';
  loading = true;
  error: string | null = null;

  constructor(private abastecimentoService: AbastecimentoService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading = true;
    this.error = null;
    this.abastecimentoService.listar().subscribe({
      next: (lista) => {
        this.abastecimentos = lista || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar abastecimentos.';
        this.loading = false;
        this.abastecimentos = [];
      }
    });
  }

  get filtered(): Abastecimento[] {
    if (!this.searchTerm?.trim()) return this.abastecimentos;
    const t = this.searchTerm.toLowerCase();
    return this.abastecimentos.filter(a =>
      (a.vehiclePlate || '').toLowerCase().includes(t) ||
      (a.vehicleName || '').toLowerCase().includes(t) ||
      (a.station || '').toLowerCase().includes(t)
    );
  }

  get totalLitros(): number {
    return this.abastecimentos.reduce((s, a) => s + (a.liters || 0), 0);
  }

  get totalCusto(): number {
    return this.abastecimentos.reduce((s, a) => s + (a.cost || 0), 0);
  }

  formatarData(d?: string): string {
    return d ? new Date(d).toLocaleDateString('pt-MZ') : '—';
  }
}
