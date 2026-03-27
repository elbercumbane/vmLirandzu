import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ClienteService, Cliente } from '../../../services/cliente.service';

export interface ClienteLinha {
  id: number;
  nome: string;
  provincia: string;
  contacto: string;
  telefone: string;
  totalEncomendas: number;
  valorTotal: number;
  saldoDevedor: number;
  ultimaEncomenda: string;
}

@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BillingSectionHeaderComponent],
  templateUrl: './clientes-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './clientes-lista.component.css']
})
export class ClientesListaComponent implements OnInit {
  filtro = '';
  clientes: ClienteLinha[] = [];
  loading = true;
  error: string | null = null;

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.error = null;
    this.clienteService.listarClientes().subscribe({
      next: (lista) => {
        this.clientes = (lista || []).map((c) => this.mapear(c));
        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar clientes. Verifique a ligação ao servidor.';
        this.loading = false;
        this.clientes = [];
      }
    });
  }

  private mapear(c: Cliente): ClienteLinha {
    const end = (c.endereco || '').trim();
    let provincia = '—';
    if (end) {
      const primeira = end.split(/[\n,]/)[0]?.trim();
      provincia = primeira && primeira.length <= 80 ? primeira : end.slice(0, 48) + (end.length > 48 ? '…' : '');
    }
    const contacto = (c.email || '').trim() || '—';
    return {
      id: c.id ?? 0,
      nome: c.nome || '—',
      provincia,
      contacto,
      telefone: (c.telefone || '').trim() || '—',
      totalEncomendas: c.numeroEncomendas ?? 0,
      valorTotal: c.valorTotalFaturado ?? 0,
      saldoDevedor: c.valorEmDivida ?? 0,
      ultimaEncomenda: '—'
    };
  }

  get clientesFiltrados(): ClienteLinha[] {
    if (!this.filtro.trim()) return this.clientes;
    const f = this.filtro.toLowerCase();
    return this.clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(f) ||
        c.provincia.toLowerCase().includes(f) ||
        c.contacto.toLowerCase().includes(f) ||
        c.telefone.toLowerCase().includes(f)
    );
  }

  get totalClientes(): number {
    return this.clientes.length;
  }
  get clientesComDivida(): number {
    return this.clientes.filter((c) => c.saldoDevedor > 0).length;
  }
  get totalFaturado(): number {
    return this.clientes.reduce((s, c) => s + c.valorTotal, 0);
  }
  get totalEmDivida(): number {
    return this.clientes.reduce((s, c) => s + c.saldoDevedor, 0);
  }

}
