import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';

@Component({
  selector: 'app-encomendas-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './encomendas-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './encomendas-lista.component.css']
})
export class EncomendasListaComponent {
  searchTerm = '';
  activeFilter = 'TODOS';

  encomendas = [
    { id: 1, numero: 'VML-2025-0001', cliente: 'Ana Rodrigues', telefone: '054212348', produto: 'iPhone 15 Pro 256GB', origem: 'Maputo', destino: 'Beira', total: 45200, pago: 45200, divida: 0, status: 'PAGO', data: '02/01/2025' },
    { id: 2, numero: 'VML-2025-0002', cliente: 'Carlos Mondlane', telefone: '084567123', produto: 'Samsung TV 55" 4K', origem: 'Johannesburg', destino: 'Maputo', total: 38500, pago: 20000, divida: 18500, status: 'PARCIAL', data: '05/01/2025' },
    { id: 3, numero: 'VML-2025-0003', cliente: 'Fátima Cossa', telefone: '872341567', produto: 'Nike Air Max + Adidas', origem: 'Durban', destino: 'Maputo', total: 12800, pago: 0, divida: 12800, status: 'NÃO PAGO', data: '07/01/2025' },
    { id: 4, numero: 'VML-2025-0004', cliente: 'José Tembe', telefone: '843219876', produto: 'Laptop Lenovo IdeaPad', origem: 'Maputo', destino: 'Nampula', total: 52000, pago: 52000, divida: 0, status: 'PAGO', data: '09/01/2025' },
    { id: 5, numero: 'VML-2025-0005', cliente: 'Maria Machava', telefone: '821456789', produto: 'Máquina de costura Singer', origem: 'Maputo', destino: 'Inhambane', total: 18300, pago: 10000, divida: 8300, status: 'PARCIAL', data: '11/01/2025' },
    { id: 6, numero: 'VML-2025-0006', cliente: 'Pedro Nhantumbo', telefone: '864523178', produto: 'PlayStation 5 + 2 jogos', origem: 'Johannesburg', destino: 'Maputo', total: 41600, pago: 41600, divida: 0, status: 'PAGO', data: '12/01/2025' },
    { id: 7, numero: 'VML-2025-0007', cliente: 'Lurdes Sitoe', telefone: '853671234', produto: 'Frigorífico Samsung', origem: 'Maputo', destino: 'Gaza', total: 29400, pago: 0, divida: 29400, status: 'NÃO PAGO', data: '14/01/2025' },
    { id: 8, numero: 'VML-2025-0008', cliente: 'António Bila', telefone: '874123456', produto: 'Roupas várias (5 peças)', origem: 'Durban', destino: 'Tete', total: 8750, pago: 8750, divida: 0, status: 'PAGO', data: '15/01/2025' }
  ];

  get filteredEncomendas() {
    let list = this.encomendas;
    if (this.activeFilter !== 'TODOS') list = list.filter(e => e.status === this.activeFilter);
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(e => e.numero.toLowerCase().includes(term) || e.cliente.toLowerCase().includes(term) || e.produto.toLowerCase().includes(term));
    }
    return list;
  }

  get totalValor() { return this.encomendas.reduce((s, e) => s + e.total, 0); }
  get totalDivida() { return this.encomendas.reduce((s, e) => s + e.divida, 0); }
  get pagoPercent() {
    const total = this.encomendas.length;
    if (total === 0) return 0;
    const pagas = this.encomendas.filter(e => e.status === 'PAGO').length;
    return Math.round((pagas / total) * 100);
  }

  get clientesEmDivida() {
    return this.encomendas.filter(e => e.divida > 0).length;
  }

  get encomendasPagas() {
    return this.encomendas.filter(e => e.status === 'PAGO').length;
  }

  setFilter(f: string) { this.activeFilter = f; }
}
