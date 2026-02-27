import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-guias-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './guias-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './guias-lista.component.css']
})
export class GuiasListaComponent {
  filtro = '';
  filtroEstado = 'TODOS';

  guias = [
    { id: 1, ref: 'GR-2025-001', data: '22/01/2025', motorista: 'João Macuácua', viatura: 'MDD-45-78 (Volvo FH16)', origem: 'Maputo', destino: 'Cabo Delgado', totalCargas: 3, totalClientes: 2, estado: 'ENTREGUE', valorTotal: 112500 },
    { id: 2, ref: 'GR-2025-002', data: '20/01/2025', motorista: 'Alberto Chissano', viatura: 'MPT-12-34 (Scania R450)', origem: 'Maputo', destino: 'Beira', totalCargas: 2, totalClientes: 2, estado: 'EM TRÂNSITO', valorTotal: 85000 },
    { id: 3, ref: 'GR-2025-003', data: '18/01/2025', motorista: 'Samuel Dinis', viatura: 'MNP-56-90 (Iveco Stralis)', origem: 'Beira', destino: 'Tete', totalCargas: 4, totalClientes: 3, estado: 'ENTREGUE', valorTotal: 145000 },
    { id: 4, ref: 'GR-2025-004', data: '15/01/2025', motorista: 'Mário Tembe', viatura: 'MTT-67-89 (Isuzu NPR)', origem: 'Maputo', destino: 'Xai-Xai', totalCargas: 1, totalClientes: 1, estado: 'ENTREGUE', valorTotal: 35000 },
    { id: 5, ref: 'GR-2025-005', data: '25/01/2025', motorista: 'Carlos Sitoe', viatura: 'MBR-89-12 (Mercedes Actros)', origem: 'Maputo', destino: 'Nampula', totalCargas: 5, totalClientes: 4, estado: 'PENDENTE', valorTotal: 198000 },
    { id: 6, ref: 'GR-2025-006', data: '23/01/2025', motorista: 'João Macuácua', viatura: 'MDD-45-78 (Volvo FH16)', origem: 'Nampula', destino: 'Maputo', totalCargas: 2, totalClientes: 1, estado: 'EM TRÂNSITO', valorTotal: 67000 }
  ];

  get guiasFiltradas() {
    let lista = this.guias;
    if (this.filtroEstado !== 'TODOS') lista = lista.filter(g => g.estado === this.filtroEstado);
    if (this.filtro.trim()) {
      const f = this.filtro.toLowerCase();
      lista = lista.filter(g => g.ref.toLowerCase().includes(f) || g.motorista.toLowerCase().includes(f) || g.destino.toLowerCase().includes(f));
    }
    return lista;
  }

  get totalGuias() { return this.guias.length; }
  get guiasEntregues() { return this.guias.filter(g => g.estado === 'ENTREGUE').length; }
  get guiasEmTransito() { return this.guias.filter(g => g.estado === 'EM TRÂNSITO').length; }
  get guiasPendentes() { return this.guias.filter(g => g.estado === 'PENDENTE').length; }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'ENTREGUE': return 'badge badge-success';
      case 'EM TRÂNSITO': return 'badge badge-warning';
      case 'PENDENTE': return 'badge badge-info';
      default: return 'badge';
    }
  }
}
