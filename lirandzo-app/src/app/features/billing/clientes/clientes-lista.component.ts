import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './clientes-lista.component.css']
})
export class ClientesListaComponent {
  filtro = '';

  clientes = [
    { id: 1, nome: 'SLR Mining, Lda', provincia: 'Cabo Delgado', contacto: 'Sr. Euclides', telefone: '847983277', nuit: 'FD17RWP', totalEncomendas: 5, valorTotal: 187500, saldoDevedor: 37500, ultimaEncomenda: '04/07/2025' },
    { id: 2, nome: 'Cervejas de Moçambique', provincia: 'Maputo Cidade', contacto: 'Sr. António', telefone: '841234567', nuit: '400012345', totalEncomendas: 12, valorTotal: 520000, saldoDevedor: 0, ultimaEncomenda: '20/01/2025' },
    { id: 3, nome: 'TotalEnergies Moçambique', provincia: 'Sofala', contacto: 'Sra. Maria', telefone: '842345678', nuit: '400098765', totalEncomendas: 8, valorTotal: 340000, saldoDevedor: 45000, ultimaEncomenda: '18/01/2025' },
    { id: 4, nome: 'Cimentos de Moçambique', provincia: 'Maputo Província', contacto: 'Sr. Carlos', telefone: '843456789', nuit: '400054321', totalEncomendas: 15, valorTotal: 890000, saldoDevedor: 0, ultimaEncomenda: '22/01/2025' },
    { id: 5, nome: 'Shoprite Moçambique', provincia: 'Nampula', contacto: 'Sr. Pedro', telefone: '844567890', nuit: '400011111', totalEncomendas: 20, valorTotal: 1250000, saldoDevedor: 125000, ultimaEncomenda: '25/01/2025' },
    { id: 6, nome: 'Sasol Petroleum', provincia: 'Inhambane', contacto: 'Sr. Domingos', telefone: '845678901', nuit: '400022222', totalEncomendas: 6, valorTotal: 280000, saldoDevedor: 0, ultimaEncomenda: '15/01/2025' },
    { id: 7, nome: 'Kenmare Resources', provincia: 'Nampula', contacto: 'Sr. James', telefone: '846789012', nuit: '400033333', totalEncomendas: 3, valorTotal: 156000, saldoDevedor: 52000, ultimaEncomenda: '10/01/2025' },
    { id: 8, nome: 'Hidroeléctrica de Cahora Bassa', provincia: 'Tete', contacto: 'Eng. Fátima', telefone: '847890123', nuit: '400044444', totalEncomendas: 4, valorTotal: 210000, saldoDevedor: 0, ultimaEncomenda: '08/01/2025' }
  ];

  get clientesFiltrados() {
    if (!this.filtro.trim()) return this.clientes;
    const f = this.filtro.toLowerCase();
    return this.clientes.filter(c =>
      c.nome.toLowerCase().includes(f) ||
      c.provincia.toLowerCase().includes(f) ||
      c.contacto.toLowerCase().includes(f)
    );
  }

  get totalClientes() { return this.clientes.length; }
  get clientesComDivida() { return this.clientes.filter(c => c.saldoDevedor > 0).length; }
  get totalFaturado() { return this.clientes.reduce((s, c) => s + c.valorTotal, 0); }
  get totalEmDivida() { return this.clientes.reduce((s, c) => s + c.saldoDevedor, 0); }

  clienteExpandido: number | null = null;

  toggleDetalhe(id: number): void {
    this.clienteExpandido = this.clienteExpandido === id ? null : id;
  }
}
